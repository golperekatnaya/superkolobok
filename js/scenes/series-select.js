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
                        (done ? '<div class="series-card-check">\u2713</div>' : '') +
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
                if (id === 'friendship') startFriendship();
                else if (id === 'teamwork') startTeamwork();
            });
        });
    }
    
    function startFriendship() {
        GameState.setCurrentSeries('friendship');
        
        // Получаем данные о серии из конфига
        var series = GameConfig.getSeriesById('friendship');
        if (!series) {
            console.error('Серия friendship не найдена в конфиге');
            return;
        }
        
        // Проверяем тип серии
        if (series.type === 'h5p' && series.h5pPath) {
            // Загружаем H5P
            loadH5PSeries(series.h5pPath);
        } else if (series.type === 'video' && series.videoPath) {
            // Загружаем обычное видео (fallback)
            loadVideoSeries(series.videoPath);
        } else {
            console.error('Неизвестный тип серии или отсутствует путь:', series);
        }
    }
    
    function loadH5PSeries(h5pPath) {
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        
        // Создаём iframe для H5P
        c.innerHTML = 
            '<div class="h5p-container" style="width:100%; height:100%; min-height:400px;">' +
                '<iframe src="' + h5pPath + '" ' +
                    'style="width:100%; height:500px; border:none;" ' +
                    'allowfullscreen ' +
                    'allow="autoplay; fullscreen">' +
                '</iframe>' +
                '<div style="text-align:center; margin-top:16px;">' +
                    '<button class="scene-btn" id="h5pCompleteBtn" style="background:#F5B342; border-radius:50px; padding:10px 24px; width:auto; color:white; font-weight:700;">Завершить просмотр</button>' +
                '</div>' +
            '</div>';
        
        var completeBtn = document.getElementById('h5pCompleteBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                completeFriendshipSeries();
            });
        }
    }
    
    function loadVideoSeries(videoPath) {
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        
        c.innerHTML = '<div class="video-scene"><video id="friendshipVideo" preload="auto" playsinline controls><source src="' + videoPath + '" type="video/mp4"></video></div>';
        
        var v = document.getElementById('friendshipVideo');
        v.addEventListener('ended', function() {
            completeFriendshipSeries();
        });
        
        v.play().catch(function() { 
            v.controls = true; 
        });
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
                Navigation.goTo(SeriesSelect.render, 1); 
            },
            onCancel: function() { 
                GameState.setCurrentSeries(null); 
                Navigation.goTo(SeriesSelect.render, 1); 
            }
        });
    }
    
    function startTeamwork() {
        GameState.setCurrentSeries('teamwork');
        Navigation.goTo(VideoScene.renderIntro, 2, 'teamwork');
    }
    
    return { render: render };
})();