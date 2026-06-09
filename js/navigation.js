// ========== NAVIGATION.JS ==========

const Navigation = (function() {
    'use strict';
    
    var _sceneContent = null;
    var _backBtn = null;
    var _homeBtn = null;
    var _profileBtn = null;
    var _soundBtn = null;
    var _resetBtn = null;
    var _isInitialized = false;
    var _currentRenderer = null;
    var _isTransitioning = false;
    var _transitionQueue = [];
    var _profileRenderer = null;
    
    function init() {
        _sceneContent = document.getElementById('sceneContent');
        _backBtn = document.getElementById('backBtn');
        _homeBtn = document.getElementById('homeBtn');
        _profileBtn = document.getElementById('profileBtn');
        _soundBtn = document.getElementById('soundToggleBtn');
        _resetBtn = document.getElementById('resetBtn');
        
        if (!_sceneContent) return false;
        
        if (_backBtn) {
            _backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                goBack();
            });
            _backBtn.style.display = 'none';
        }
        
        if (_homeBtn) {
            _homeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                goHome();
            });
        }
        
        if (_profileBtn) {
            _profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!_isTransitioning) showProfile();
            });
            _profileBtn.style.display = 'none';
        }
        
        if (_soundBtn) {
            _soundBtn.addEventListener('click', function() {
                if (typeof AudioManager !== 'undefined') {
                    var isOn = AudioManager.toggleMute();
                    var icon = document.getElementById('soundIcon');
                    if (icon) icon.style.opacity = isOn ? '1' : '0.5';
                }
            });
        }
        
        if (_resetBtn) {
            _resetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                goHome();
            });
        }
        
        _isInitialized = true;
        return true;
    }
    
    function goTo(rendererFn, sceneIndex, seriesId) {
        if (!_isInitialized || typeof rendererFn !== 'function') return;
        
        if (_isTransitioning) {
            _transitionQueue.push({ renderer: rendererFn, index: sceneIndex, series: seriesId });
            return;
        }
        
        _isTransitioning = true;
        
        if (_currentRenderer !== null && typeof sceneIndex === 'number') {
            GameState.pushHistory(sceneIndex);
        }
        
        _profileRenderer = null;
        if (seriesId) GameState.setCurrentSeries(seriesId);
        if (typeof sceneIndex === 'number') Progress.update(sceneIndex);
        
        clearCurrentScene();
        try {
            rendererFn();
            _currentRenderer = rendererFn;
        } catch (e) {
            console.error('[Nav] Ошибка:', e);
        }
        updateButtons();
        
        _isTransitioning = false;
        processQueue();
    }
    
    function goBack() {
        if (!_isInitialized || _isTransitioning) return;
        
        if (_profileRenderer) {
            _isTransitioning = true;
            clearCurrentScene();
            _profileRenderer();
            _profileRenderer = null;
            updateButtons();
            _isTransitioning = false;
            return;
        }
        
        if (!GameState.canGoBack()) return;
        
        var prev = GameState.popHistory();
        if (!prev) return;
        
        _isTransitioning = true;
        Progress.update(prev.sceneId);
        if (prev.seriesId) GameState.setCurrentSeries(prev.seriesId);
        
        clearCurrentScene();
        if (typeof _currentRenderer === 'function') _currentRenderer();
        updateButtons();
        _isTransitioning = false;
    }
    
    function goHome() {
        if (_isTransitioning) return;
        
        closeAllPopups();
        AudioManager.stopAll();
        _profileRenderer = null;
        _currentRenderer = null;
        GameState.setCurrentSeries(null);
        
        _isTransitioning = true;
        clearCurrentScene();
        SeriesSelect.render();
        updateButtons();
        _isTransitioning = false;
    }
    
    function showProfile() {
        if (_isTransitioning) return;
        
        _isTransitioning = true;
        closeAllPopups();
        _profileRenderer = _currentRenderer;
        clearCurrentScene();
        
        var name = GameState.getChildName();
        var friendshipDone = GameState.isSeriesCompleted('friendship');
        var teamworkDone = GameState.isSeriesCompleted('teamwork');
        var stars = GameState.getStars();
        var totalKeys = (friendshipDone ? 1 : 0) + (teamworkDone ? 1 : 0);
        
        var medalsHtml = '';
        
        medalsHtml += 
            '<div class="medal-item' + (friendshipDone ? ' earned' : '') + '">' +
                '<div class="medal-icon">' +
                    '<img src="media/images/key-friendship.png" alt="" onerror="this.parentElement.innerHTML=\'' + (friendshipDone ? '\u2605' : '\u2606') + '\';this.parentElement.style.fontSize=\'28px\';this.parentElement.style.color=\'#F5B342\';">' +
                '</div>' +
                '<div class="medal-name">Сила дружбы</div>' +
            '</div>';
        
        medalsHtml += 
            '<div class="medal-item' + (teamworkDone ? ' earned' : '') + '">' +
                '<div class="medal-icon">' +
                    '<img src="media/images/key-team.png" alt="" onerror="this.parentElement.innerHTML=\'' + (teamworkDone ? '\u2605' : '\u2606') + '\';this.parentElement.style.fontSize=\'28px\';this.parentElement.style.color=\'#F5B342\';">' +
                '</div>' +
                '<div class="medal-name">Сила команды</div>' +
            '</div>';
        
        for (var i = 1; i <= 3; i++) {
            medalsHtml += 
                '<div class="medal-item' + (stars >= i ? ' earned' : '') + '">' +
                    '<div class="medal-icon">' +
                        '<img src="media/images/key-icon.png" alt="" onerror="this.parentElement.innerHTML=\'' + (stars >= i ? '\u2605' : '\u2606') + '\';this.parentElement.style.fontSize=\'28px\';this.parentElement.style.color=\'#F5B342\';">' +
                    '</div>' +
                    '<div class="medal-name">Звезда ' + i + '</div>' +
                '</div>';
        }
        
        _sceneContent.innerHTML = 
            '<div class="profile-screen">' +
                '<div class="profile-card">' +
                    '<button class="popup-close-btn profile-close-btn" id="profileCloseBtn">\u2715</button>' +
                    '<div class="profile-avatar">' +
                        '<img src="media/images/kolobok.svg" alt="" onerror="this.src=\'media/images/firefly.png\'">' +
                    '</div>' +
                    '<div class="profile-name">' + (name || 'Гость') + '</div>' +
                    '<div class="profile-stars">' +
                        '<span>' + (stars >= 1 ? '\u2605' : '\u2606') + '</span>' +
                        '<span>' + (stars >= 2 ? '\u2605' : '\u2606') + '</span>' +
                        '<span>' + (stars >= 3 ? '\u2605' : '\u2606') + '</span>' +
                    '</div>' +
                    '<div class="profile-keys-count">' +
                        '<img src="media/images/key-icon.png" alt="" style="width:24px;height:24px;">' +
                        '<span>' + totalKeys + ' / 2</span>' +
                    '</div>' +
                    '<div class="profile-section-title">Награды</div>' +
                    '<div class="medals-grid">' + medalsHtml + '</div>' +
                    '<div class="profile-chest" id="profileChest">' +
                        '<div class="profile-chest-icon">\uD83D\uDDE4</div>' +
                        '<div>Сундук с материалами</div>' +
                    '</div>' +
                    '<button class="profile-back-btn" id="profileBackBtn">Назад</button>' +
                '</div>' +
            '</div>';
        
        function closeProfile() {
            if (_profileRenderer) {
                clearCurrentScene();
                _profileRenderer();
                _profileRenderer = null;
                updateButtons();
            }
            _isTransitioning = false;
        }
        
        document.getElementById('profileBackBtn').addEventListener('click', closeProfile);
        document.getElementById('profileCloseBtn').addEventListener('click', closeProfile);
        document.getElementById('profileChest').addEventListener('click', function() {
            alert('Здесь будут храниться PDF-файлы с дополнительными материалами.\nСкоро появится!');
        });
        
        _backBtn.style.display = 'flex';
        if (_profileBtn) _profileBtn.style.display = 'none';
    }
    
    function clearCurrentScene() {
        if (!_sceneContent) return;
        var videos = _sceneContent.querySelectorAll('video');
        videos.forEach(function(v) {
            v.pause();
            v.src = '';
            v.load();
        });
        _sceneContent.innerHTML = '';
        if (typeof AudioManager !== 'undefined' && AudioManager.isPlaying()) {
            AudioManager.stopAll();
        }
    }
    
    function processQueue() {
        if (_transitionQueue.length === 0) return;
        var next = _transitionQueue.shift();
        setTimeout(function() {
            goTo(next.renderer, next.index, next.series);
        }, 50);
    }
    
    function updateButtons() {
        if (_backBtn) _backBtn.style.display = (GameState.canGoBack() || _profileRenderer) ? 'flex' : 'none';
        
        var onMain = !GameState.getCurrentSeries();
        
        if (_homeBtn) _homeBtn.style.display = onMain ? 'none' : 'flex';
        if (_soundBtn) _soundBtn.style.display = 'flex';
        if (_resetBtn) _resetBtn.style.display = onMain ? 'none' : 'flex';
        if (_profileBtn) _profileBtn.style.display = onMain && GameState.hasChildName() ? 'flex' : 'none';
        
        // Обновляем ключик в хедере
        var keysBadge = document.getElementById('headerKeysBadge');
        var keysCount = document.getElementById('headerKeysCount');
        if (keysBadge && keysCount) {
            if (onMain && GameState.hasChildName()) {
                keysBadge.style.display = 'flex';
                var friendshipDone = GameState.isSeriesCompleted('friendship');
                var teamworkDone = GameState.isSeriesCompleted('teamwork');
                var totalKeys = (friendshipDone ? 1 : 0) + (teamworkDone ? 1 : 0);
                keysCount.textContent = totalKeys;
            } else {
                keysBadge.style.display = 'none';
            }
        }
    }
    
    function closeAllPopups() {
        var popups = document.querySelectorAll('#gamePopupOverlay, #testPopupOverlay, .game-popup-overlay');
        popups.forEach(function(p) { p.remove(); });
    }
    
    return {
        init: init,
        goTo: goTo,
        goBack: goBack,
        goHome: goHome,
        showProfile: showProfile,
        closeAllPopups: closeAllPopups,
        clearQueue: function() { _transitionQueue = []; },
        updateButtons: updateButtons
    };
})();