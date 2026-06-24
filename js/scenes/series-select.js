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
                if (id === 'friendship') startFriendship();
                else if (id === 'teamwork') startTeamwork();
            });
        });
    }
    
    function startFriendship() {
        GameState.setCurrentSeries('friendship');
        
        var series = GameConfig.getSeriesById('friendship');
        if (!series || !series.videoPath) {
            console.error('Video path not found for friendship series');
            return;
        }
        
        loadVideoSeries(series.videoPath);
    }
    
    function loadVideoSeries(videoPath) {
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        
        c.innerHTML = 
            '<div class="video-scene">' +
                '<video id="friendshipVideo" preload="auto" playsinline autoplay controls style="width:100%;display:block;">' +
                    '<source src="' + videoPath + '" type="video/mp4">' +
                '</video>' +
            '</div>';
        
        var video = document.getElementById('friendshipVideo');
        
        // Обработка окончания видео
        video.addEventListener('ended', function() {
            completeFriendshipSeries();
        });
        
        // Обработка ошибки загрузки видео
        video.addEventListener('error', function(e) {
            console.error('Video error:', e);
            console.log('Video path:', videoPath);
            var errorMsg = '';
            switch (video.error ? video.error.code : 0) {
                case 1:
                    errorMsg = 'Загрузка видео прервана.';
                    break;
                case 2:
                    errorMsg = 'Сеть недоступна. Проверьте соединение.';
                    break;
                case 3:
                    errorMsg = 'Видео повреждено или не поддерживается.';
                    break;
                case 4:
                    errorMsg = 'Формат видео не поддерживается браузером.';
                    break;
                default:
                    errorMsg = 'Не удалось загрузить видео.';
            }
            c.innerHTML = '<div style="text-align:center;padding:40px;"><p>' + errorMsg + '</p><button onclick="location.reload()" style="background:#F5B342;color:white;border:none;padding:10px 20px;border-radius:50px;cursor:pointer;">Обновить</button></div>';
        });
        
        // Автовоспроизведение с обработкой ошибки
        video.play().catch(function(error) {
            console.log('Autoplay blocked:', error);
            video.controls = true;
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