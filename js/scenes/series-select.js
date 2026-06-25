// ========== SERIES-SELECT.JS ==========

const SeriesSelect = (function() {
    'use strict';
    
    function render() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.hide();
        UI.clearContainer(c);
        
        var series = GameConfig.getSeries();
        var cardsHtml = '';
        
        series.forEach(function(s) {
            var done = GameState.isSeriesCompleted(s.id);
            var locked = (s.order === 2 && !GameState.isSeriesCompleted('friendship'));
            var cls = done ? 'completed' : (locked ? 'locked' : '');
            var badge = done ? 'Пройдено' : (locked ? 'Сначала пройди первую' : '');
            var thumb = 'media/images/series' + s.order + '-thumb.png';
            
            cardsHtml += 
                '<div class="series-card ' + cls + '" data-series-id="' + s.id + '">' +
                    '<div class="series-card-thumb">' +
                        '<img src="' + thumb + '" alt="' + s.name + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
                        (done ? '<div class="series-card-check">✓</div>' : '') +
                    '</div>' +
                    '<div class="series-card-info">' +
                        '<div class="series-card-name">' + s.name + '</div>' +
                        (badge ? '<div class="series-card-badge">' + badge + '</div>' : '') +
                    '</div>' +
                '</div>';
        });
        
        c.innerHTML = 
            '<div class="menu-screen">' +
                '<div class="menu-firefly" id="menuFirefly"></div>' +
                '<h1 class="menu-title">Суперколобок</h1>' +
                '<p class="menu-subtitle">Качусь и учусь</p>' +
                '<div class="menu-cards">' + cardsHtml + '</div>' +
            '</div>';
        
        document.getElementById('menuFirefly').appendChild(UI.createClickableFirefly(70, 'seriesSelect'));
        setTimeout(function() { AudioManager.playVoice('seriesSelect'); }, 500);
        
        c.querySelectorAll('.series-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var id = card.dataset.seriesId;
                if (card.classList.contains('locked')) {
                    card.style.animation = 'none';
                    card.offsetHeight;
                    card.style.animation = 'shake 0.5s ease';
                    setTimeout(function() { card.style.animation = ''; }, 500);
                    return;
                }
                if (id === 'friendship') startFriendshipSequence();
                else if (id === 'teamwork') startTeamwork();
            });
        });
    }
    
    // ============================================================
    // ЛОГИКА ДЛЯ СЕРИИ «СИЛА ДРУЖБЫ» (8 РОЛИКОВ)
    // ============================================================
    
    function startFriendshipSequence() {
        GameState.setCurrentSeries('friendship');
        GameState.pushHistory(1);
        
        var sequence = [
            { video: 'series-1', button: 'lamp' },
            { video: 'series-2', button: 'nota-btn' },
            { video: 'series-3', button: null },
            { video: 'series-4', button: null },
            { video: 'series-5', button: null },
            { video: 'series-6', button: null },
            { video: 'series-7', button: null },
            { video: 'series-8', button: null }
        ];
        
        window._friendshipSequence = sequence;
        window._friendshipIndex = 0;
        
        playSequenceStep(sequence, 0);
    }
    
    function playSequenceStep(sequence, index) {
        if (index >= sequence.length) {
            window._friendshipSequence = null;
            window._friendshipIndex = 0;
            completeFriendshipSeries();
            return;
        }
        
        window._friendshipIndex = index;
        
        var step = sequence[index];
        var videoKey = step.video;
        var buttonKey = step.button;
        
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo(videoKey);
        if (!src) {
            console.error('[SeriesSelect] Видео не найдено:', videoKey);
            // Показываем сообщение, НЕ ПЕРЕХОДИМ ДАЛЬШЕ!
            c.innerHTML = 
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;background:#000;color:white;text-align:center;padding:20px;">' +
                    '<p style="color:#F5B342;font-size:1.3rem;font-weight:700;margin-bottom:12px;">⚠️ Видео не найдено</p>' +
                    '<p style="color:#aaa;font-size:0.9rem;margin-bottom:16px;">' + videoKey + '</p>' +
                    '<button onclick="location.reload()" style="background:#F5B342;border:none;padding:10px 28px;border-radius:50px;color:white;font-weight:700;font-size:1rem;cursor:pointer;">Обновить</button>' +
                '</div>';
            return;
        }
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;width:100%;background:#000;">' +
                '<video id="seqVideo" preload="auto" playsinline autoplay style="width:100%;display:block;">' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div id="seqBtnOverlay" style="position:absolute;bottom:60px;left:0;right:0;display:flex;justify-content:center;z-index:10;pointer-events:none;">' +
                '</div>' +
            '</div>';
        
        var video = document.getElementById('seqVideo');
        var overlay = document.getElementById('seqBtnOverlay');
        
        var btnShown = false;
        var btn = null;
        
        if (buttonKey) {
            btn = UI.createSceneButton(buttonKey, 'pulse-btn', function() {
                playSequenceStep(sequence, index + 1);
            });
            btn.style.display = 'none';
            btn.style.pointerEvents = 'auto';
            btn.style.width = '60px';
            btn.style.height = '60px';
            overlay.appendChild(btn);
        }
        
        video.addEventListener('timeupdate', function() {
            if (!btnShown && btn && video.duration - video.currentTime <= 1.0) {
                btnShown = true;
                btn.style.display = 'block';
            }
        });
        
        video.addEventListener('ended', function() {
            if (!btn) {
                playSequenceStep(sequence, index + 1);
            }
        });
        
        // ===== ИСПРАВЛЕННАЯ ОБРАБОТКА ОШИБОК (БЕЗ АВТО-ПЕРЕХОДА И RELOAD) =====
        video.addEventListener('error', function(e) {
            console.error('[SeriesSelect] Ошибка видео:', videoKey);
            console.error('  - error code:', video.error ? video.error.code : 'unknown');
            
            // НЕ ПЕРЕХОДИМ К СЛЕДУЮЩЕМУ РОЛИКУ!
            // НЕ ПЕРЕЗАГРУЖАЕМ СТРАНИЦУ!
            // Просто показываем сообщение
            c.innerHTML = 
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;background:#000;color:white;text-align:center;padding:20px;">' +
                    '<p style="color:#F5B342;font-size:1.3rem;font-weight:700;margin-bottom:12px;">⚠️ Видео не загрузилось</p>' +
                    '<p style="color:#aaa;font-size:0.9rem;margin-bottom:16px;">' + videoKey + '</p>' +
                    '<button onclick="location.reload()" style="background:#F5B342;border:none;padding:10px 28px;border-radius:50px;color:white;font-weight:700;font-size:1rem;cursor:pointer;">Попробовать снова</button>' +
                '</div>';
        });
        
        video.play().catch(function() {
            video.controls = true;
        });
        
        if (typeof Navigation !== 'undefined' && Navigation.updateButtons) {
            Navigation.updateButtons();
        }
    }
    
    function completeFriendshipSeries() {
        GameState.completeSeries('friendship');
        GameState.addStar();
        
        Popup.openConfirmPopup({
            title: 'Отлично!',
            message: 'Вы прошли серию "Сила дружбы"!\nПолучена звезда!',
            confirmText: 'К выбору серий',
            cancelText: 'Закрыть',
            onConfirm: function() { 
                GameState.setCurrentSeries(null); 
                window._friendshipSequence = null;
                window._friendshipIndex = 0;
                Navigation.goTo(SeriesSelect.render, 1); 
            },
            onCancel: function() { 
                GameState.setCurrentSeries(null); 
                window._friendshipSequence = null;
                window._friendshipIndex = 0;
                Navigation.goTo(SeriesSelect.render, 1); 
            }
        });
    }
    
    function startTeamwork() {
        GameState.setCurrentSeries('teamwork');
        Navigation.goTo(VideoScene.renderIntro, 2, 'teamwork');
    }
    
    return { 
        render: render,
        _playSequenceStep: playSequenceStep,
        _restartSequence: function() {
            window._friendshipSequence = null;
            window._friendshipIndex = 0;
            startFriendshipSequence();
        }
    };
})();