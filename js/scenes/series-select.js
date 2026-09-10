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
            var locked = false;
            var cls = done ? 'completed' : '';
            var badge = done ? 'Пройдено' : '';
            var thumb = '';
            if (s.thumb) thumb = s.thumb;
            if (!thumb) thumb = (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) ? GameConfig.getImage('series' + s.order + '-thumb') : '';
            if (!thumb) thumb = 'media/images/series' + s.order + '-thumb.png';
            
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
        
        var menuFirefly = document.getElementById('menuFirefly');
        if (menuFirefly) {
            menuFirefly.appendChild(UI.createClickableFirefly(70, 'seriesSelect'));
        }
        
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
                else if (id === 'care') startCare();
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

        // buttonPos — куда положить кнопку поверх ролика.
        // top и left — проценты от верха и левого края видео.
        // Центр — примерно 50% / 50%.
        var sequence = [
            { video: 'series-1', button: 'lamp',     showBeforeEnd: 1, buttonPos: { top: '82%', left: '50%' } },
            { video: 'series-2', button: 'nota-btn', showBeforeEnd: 4, buttonPos: { top: '68%', left: '83%' } },
            { video: 'series-3', button: 'play-btn', showBeforeEnd: 3, buttonPos: { top: '72%', left: '83%' } },
            { video: 'series-4', button: null,       showBeforeEnd: 0 }
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
        var showBeforeEnd = typeof step.showBeforeEnd === 'number' ? step.showBeforeEnd : 1;
        var buttonPos = step.buttonPos || null;

        var c = document.getElementById('sceneContent');
        if (!c) return;
        UI.clearContainer(c);

        var src = GameConfig.getVideo(videoKey);
        if (!src) {
            console.error('[SeriesSelect] Видео не найдено:', videoKey);
            c.innerHTML = '<p style="color:#fff">Видео не найдено: ' + videoKey + '</p>';
            return;
        }

        // Баннер «Здравствуй, ИМЯ» — только на первом ролике серии
        var bannerHtml = '';
        if (index === 0) {
            var name = GameState.getChildName();
            if (name) {
                bannerHtml = '<div class="name-banner">Здравствуй, ' + name + '!</div>';
            }
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'video-scene';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.background = '#000';

        var video = document.createElement('video');
        video.id = 'seqVideo';
        video.preload = 'auto';
        video.playsInline = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.display = 'block';
        video.dataset.isSequenceVideo = '1';
        try { video.src = src; } catch (e) {}

        var overlay = document.createElement('div');
        overlay.id = 'seqBtnOverlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.display = 'block';       // был flex, теперь просто контейнер
        overlay.style.zIndex = '10';
        overlay.style.pointerEvents = 'none';

        if (bannerHtml) {
            var banner = document.createElement('div');
            banner.innerHTML = bannerHtml;
            wrapper.appendChild(banner.firstChild);
        }
        wrapper.appendChild(video);
        wrapper.appendChild(overlay);
        c.appendChild(wrapper);

        var btnShown = false;
        var btn = null;
        if (buttonKey) {
            btn = UI.createSceneButton(buttonKey, 'pulse-btn', function() {
                try {
                    window.__sequenceVideoTransition = true;
                    video.dataset.isIntentionalReset = '1';
                    video.pause();
                    video.removeAttribute('src');
                } catch (e) {}
                playSequenceStep(sequence, index + 1);
            });
            btn.style.display = 'none';
            btn.style.pointerEvents = 'auto';
            btn.style.width = '62px';
            btn.style.height = '62px';
            btn.style.zIndex = '20';
            btn.style.margin = '0';

            // Позиционируем кнопку по координатам из buttonPos
            if (buttonPos) {
                btn.style.position = 'absolute';
                btn.style.top = buttonPos.top;
                btn.style.left = buttonPos.left;
                // Сдвигаем кнопку так, чтобы её центр совпал с точкой (top, left)
                btn.style.transform = 'translate(-50%, -50%)';
            } else {
                // Фоллбэк: центрируем по старому
                btn.style.position = 'absolute';
                btn.style.top = '50%';
                btn.style.left = '50%';
                btn.style.transform = 'translate(-50%, -50%)';
            }

            overlay.appendChild(btn);
        }

        video.addEventListener('timeupdate', function() {
            if (!btnShown && btn && video.duration && video.duration - video.currentTime <= showBeforeEnd) {
                btnShown = true;
                btn.style.display = 'block';
            }
        });

        video.addEventListener('ended', function() {
            if (!btn) {
                playSequenceStep(sequence, index + 1);
            }
        });

        video.addEventListener('error', function() {
            if (
                video.dataset.isIntentionalReset === '1' ||
                window.__sequenceVideoTransition === true ||
                !video.isConnected ||
                !video.currentSrc
            ) {
                return;
            }
            console.error('[SeriesSelect] Ошибка видео:', videoKey);
            c.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;background:#000;color:white;text-align:center;padding:20px;">' +
                    '<p style="color:#F5B342;font-size:1.3rem;font-weight:700;margin-bottom:12px;">⚠️ Видео не загрузилось</p>' +
                    '<p style="color:#aaa;font-size:0.9rem;margin-bottom:8px;">' + videoKey + '</p>' +
                    '<a href="' + src + '" target="_blank" style="color:#F5B342;margin-bottom:16px;">Открыть ресурс в новой вкладке</a>' +
                    '<button onclick="location.reload()" style="background:#F5B342;border:none;padding:10px 28px;border-radius:50px;color:white;font-weight:700;font-size:1rem;cursor:pointer;">Попробовать снова</button>' +
                '</div>';
        });

        video.play().catch(function() {
            try { video.controls = true; } catch (e) {}
        });

        if (typeof Navigation !== 'undefined' && Navigation.updateButtons) {
            Navigation.updateButtons();
        }
    }
    
    function completeFriendshipSeries() {
        GameState.completeSeries('friendship');
        GameState.addStar();

        var materialFile = 'series1-materials.pdf';
        GameState.addMaterial(materialFile);

        Popup.openConfirmPopup({
            title: 'Отлично!',
            message: 'Вы прошли серию "Сила дружбы"!\nМатериал для скачивания добавлен в ваш сундук.',
            confirmText: 'К выбору серий',
            cancelText: 'Скачать материал',
            onConfirm: function() { 
                GameState.setCurrentSeries(null); 
                window._friendshipSequence = null;
                window._friendshipIndex = 0;
                Navigation.goTo(SeriesSelect.render, 1); 
            },
            onCancel: function() { 
                window.open('media/bonus/' + materialFile, '_blank');
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

    function startCare() {
        GameState.setCurrentSeries('care');
        GameState.pushHistory(1);

        // Те же координаты, что и у серии «Сила дружбы»
        var sequence = [
            { video: 'series2_1', button: 'lamp',         buttonPos: { top: '82%', left: '50%' } },
            { video: 'series2_2', button: 'nota-btn',     buttonPos: { top: '68%', left: '83%' } },
            { video: 'series2_3', button: 'footprints-btn', buttonPos: { top: '72%', left: '83%' } },
            { video: 'series2_4', button: null }
        ];

        window._careSequence = sequence;
        window._careIndex = 0;
        playCareSequenceStep(sequence, 0);
    }

    function playCareSequenceStep(sequence, index) {
        if (index >= sequence.length) {
            window._careSequence = null;
            window._careIndex = 0;
            completeCareSeries();
            return;
        }

        window._careIndex = index;

        var step = sequence[index];
        var videoKey = step.video;
        var buttonKey = step.button;
        var buttonPos = step.buttonPos || null;
        var c = document.getElementById('sceneContent');
        if (!c) return;

        UI.clearContainer(c);

        var src = GameConfig.getVideo(videoKey);
        if (!src) {
            console.error('[SeriesSelect] Видео серии care не найдено:', videoKey);
            c.innerHTML = '<p style="color:#fff">Видео не найдено: ' + videoKey + '</p>';
            return;
        }

        // Баннер «Здравствуй, ИМЯ» — только на первом ролике серии
        var bannerHtml = '';
        if (index === 0) {
            var name = GameState.getChildName();
            if (name) {
                bannerHtml = '<div class="name-banner">Здравствуй, ' + name + '!</div>';
            }
        }

        var wrapper = document.createElement('div');
        wrapper.className = 'video-scene';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.background = '#000';

        var video = document.createElement('video');
        video.id = 'careSequenceVideo';
        video.preload = 'auto';
        video.playsInline = true;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.display = 'block';
        try { video.src = src; } catch (e) {}

        var overlay = document.createElement('div');
        overlay.id = 'careSequenceOverlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.display = 'block';
        overlay.style.zIndex = '10';
        overlay.style.pointerEvents = 'none';

        if (bannerHtml) {
            var banner = document.createElement('div');
            banner.innerHTML = bannerHtml;
            wrapper.appendChild(banner.firstChild);
        }
        wrapper.appendChild(video);
        wrapper.appendChild(overlay);
        c.appendChild(wrapper);

        var btn = null;
        if (buttonKey) {
            btn = UI.createSceneButton(buttonKey, 'pulse-btn', function() {
                try {
                    window.__careSequenceVideoTransition = true;
                    video.dataset.isIntentionalReset = '1';
                    video.pause();
                    video.removeAttribute('src');
                } catch (e) {}
                playCareSequenceStep(sequence, index + 1);
            });
            btn.style.display = 'none';
            btn.style.pointerEvents = 'auto';
            btn.style.width = '62px';
            btn.style.height = '62px';
            btn.style.zIndex = '20';
            btn.style.margin = '0';

            if (buttonPos) {
                btn.style.position = 'absolute';
                btn.style.top = buttonPos.top;
                btn.style.left = buttonPos.left;
                btn.style.transform = 'translate(-50%, -50%)';
            } else {
                btn.style.position = 'absolute';
                btn.style.top = '50%';
                btn.style.left = '50%';
                btn.style.transform = 'translate(-50%, -50%)';
            }

            overlay.appendChild(btn);
        }

        if (btn) {
            video.addEventListener('timeupdate', function() {
                if (video.duration && video.currentTime >= video.duration - 1.2) {
                    btn.style.display = 'block';
                }
            });
        }

        video.addEventListener('ended', function() {
            if (!btn) {
                playCareSequenceStep(sequence, index + 1);
            }
        });

        video.addEventListener('error', function() {
            if (
                window.__careSequenceVideoTransition === true ||
                video.dataset.isIntentionalReset === '1' ||
                !video.isConnected ||
                !video.currentSrc
            ) {
                return;
            }
            c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:300px;color:white;background:#000;text-align:center;padding:20px;">Видео не загрузилось: ' + videoKey + '</div>';
        });

        video.play().catch(function() {
            try { video.controls = true; } catch (e) {}
        });

        if (typeof Navigation !== 'undefined' && Navigation.updateButtons) {
            Navigation.updateButtons();
        }
    }

    function completeCareSeries() {
        GameState.completeSeries('care');
        GameState.addStar();

        var materialFile = 'series2-materials.pdf';
        GameState.addMaterial(materialFile);

        Popup.openConfirmPopup({
            title: 'Отлично!',
            message: 'Вы прошли серию "Сила заботы"!\nМатериал для скачивания добавлен в ваш сундук.',
            confirmText: 'К выбору серий',
            cancelText: 'Скачать материал',
            onConfirm: function() {
                GameState.setCurrentSeries(null);
                window._careSequence = null;
                window._careIndex = 0;
                Navigation.goTo(SeriesSelect.render, 1);
            },
            onCancel: function() {
                window.open('media/bonus/' + materialFile, '_blank');
                GameState.setCurrentSeries(null);
                window._careSequence = null;
                window._careIndex = 0;
                Navigation.goTo(SeriesSelect.render, 1);
            }
        });
    }
    
    return { 
        render: render,
        _playSequenceStep: playSequenceStep,
        _restartSequence: function() {
            window._friendshipSequence = null;
            window._friendshipIndex = 0;
            startFriendshipSequence();
        },
        _playCareSequenceStep: playCareSequenceStep,
        _restartCareSeries: function() {
            window._careSequence = null;
            window._careIndex = 0;
            startCare();
        }
    };
})();