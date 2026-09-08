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
            _backBtn.addEventListener('click', function(e) { e.preventDefault(); goBack(); });
            _backBtn.style.display = 'none';
        }
        
        if (_homeBtn) {
            _homeBtn.addEventListener('click', function(e) { e.preventDefault(); goHome(); });
        }
        
        if (_profileBtn) {
            _profileBtn.addEventListener('click', function(e) { e.preventDefault(); if (!_isTransitioning) showProfile(); });
            _profileBtn.style.display = 'none';
        }
        
        if (_soundBtn) {
            _soundBtn.addEventListener('click', function() { if (typeof AudioManager !== 'undefined') AudioManager.toggleMute(); });
        }
        
        if (_resetBtn) {
            _resetBtn.addEventListener('click', function(e) { e.preventDefault(); goHome(); });
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
    
    function goToScene(sceneId) {
        var scene = GameConfig.getScene(sceneId);
        if (!scene) return;
        var renderer = getRendererBySceneType(scene.type);
        if (renderer) goTo(renderer, sceneId, scene.seriesId);
    }
    
    function getRendererBySceneType(type) {
        switch(type) {
            case 'name-screen': return NameScreen.render;
            case 'series-select': return SeriesSelect.render;
            case 'video-auto': return VideoScene.renderIntro;
            case 'video-manual': return function() { VideoScene.renderVideoSceneManualWithNext(type); };
            case 'sandbox-interactive': return VideoScene.renderSandboxInteractive;
            case 'sandbox-series': if (typeof SandboxSeries !== 'undefined') return SandboxSeries.render; return null;
            case 'hint': return function() { HintScreen.renderBySceneId(); };
            case 'game-intro': return Game1.renderIntro;
            case 'game-1': return Game1.openGame;
            case 'game-2': return Game2.openGame;
            case 'game-3': return Game3.openGame;
            case 'test': return Test.render;
            default: return null;
        }
    }
    
    function renderVideoSceneManualWithNext(videoKey) {
        var scene = GameConfig.getScene(GameState.getCurrentScene());
        var nextId = scene ? scene.nextScene : null;
        VideoScene.renderVideoSceneManual(videoKey, 'arrowBtn', 'glow', 3, function() {
            if (nextId !== null) goToScene(nextId);
        }, GameState.getCurrentScene(), true);
    }
    
    function goBack() {
        if (!_isInitialized || _isTransitioning) return;

        if (window._friendshipSequence && window._friendshipIndex !== undefined) {
            if (window._friendshipIndex > 0) {
                var prevIndex = window._friendshipIndex - 1;
                if (typeof SeriesSelect !== 'undefined' && SeriesSelect._playSequenceStep) {
                    SeriesSelect._playSequenceStep(window._friendshipSequence, prevIndex);
                } else {
                    window._friendshipIndex = 0;
                    if (typeof SeriesSelect !== 'undefined' && SeriesSelect._restartSequence) SeriesSelect._restartSequence();
                }
                return;
            } else {
                window._friendshipSequence = null;
                window._friendshipIndex = 0;
                goTo(SeriesSelect.render, 1);
                return;
            }
        }

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
        window._friendshipSequence = null;
        window._friendshipIndex = 0;
        closeAllPopups();
        if (typeof AudioManager !== 'undefined') AudioManager.stopAll();
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

        var name = GameState.getChildName() || 'Гость';
        var friendshipDone = GameState.isSeriesCompleted('friendship');
        var careDone = GameState.isSeriesCompleted('care');
        var teamworkDone = GameState.isSeriesCompleted('teamwork');
        var stars = GameState.getStars();
        var totalKeys = (friendshipDone ? 1 : 0) + (careDone ? 1 : 0) + (teamworkDone ? 1 : 0);

        var medalsHtml = '';
            medalsHtml += '<div class="medal-item' + (friendshipDone ? ' earned' : '') + '">' +
                '<div class="medal-icon" data-key="friendship"><img src="media/images/key-friendship.png" alt=""></div>' +
                '<div class="medal-name">Сила дружбы</div></div>';

            medalsHtml += '<div class="medal-item' + (careDone ? ' earned' : '') + '">' +
                '<div class="medal-icon" data-key="care"><img src="media/images/key-care.png" alt=""></div>' +
                '<div class="medal-name">Сила заботы</div></div>';

            medalsHtml += '<div class="medal-item' + (teamworkDone ? ' earned' : '') + '">' +
                '<div class="medal-icon" data-key="teamwork"><img src="media/images/key-team.png" alt=""></div>' +
                '<div class="medal-name">Сила команды</div></div>';

        var savedAvatar = localStorage.getItem('avatar') || 'media/images/kolobok.svg';

        // Создаём overlay
        var overlay = document.createElement('div');
        overlay.id = 'profileOverlay';
        overlay.className = 'game-popup-overlay';
        overlay.innerHTML = '<div class="profile-card">'
            + '<button class="popup-close-btn profile-close-btn" id="profileCloseBtn">&times;</button>'
            + '<div class="profile-avatar" id="profileAvatar"><img src="' + savedAvatar + '" alt="Аватар" id="avatarImg"></div>'
            + '<button class="profile-avatar-btn" id="changeAvatarBtn">Сменить аватар</button>'
            + '<input type="file" id="avatarInput" accept="image/*" style="display:none;">'
            + '<div class="profile-name">' + name + '</div>'
            + '<div class="profile-stars"><span>' + (stars >= 1 ? '★' : '☆') + '</span><span>' + (stars >= 2 ? '★' : '☆') + '</span><span>' + (stars >= 3 ? '★' : '☆') + '</span></div>'
            + '<div class="profile-keys-count"><img src="media/images/key-icon.png" alt="" style="width:24px;height:24px;"><span>' + totalKeys + ' / 3</span></div>'
            + '<div class="profile-section-title">Награды</div><div class="medals-grid">' + medalsHtml + '</div>'
            + '<div class="profile-chest" id="profileChest"><div class="profile-chest-icon">&#128451;</div><div>Сундук с материалами</div></div>'
            + '<button class="profile-back-btn" id="profileBackBtn">Назад</button>'
            + '</div>';

        document.body.appendChild(overlay);

        // fallback handlers for medal icons if images fail to load
        (function() {
            var medalIcons = overlay.querySelectorAll('.medal-icon');
            medalIcons.forEach(function(el) {
                var img = el.querySelector('img');
                if (!img) return;
                img.onerror = function() {
                    var key = el.getAttribute('data-key');
                    var earned = false;
                    try { earned = !!(key && GameState.isSeriesCompleted(key)); } catch (e) { earned = false; }
                    el.innerHTML = earned ? '★' : '☆';
                    el.style.fontSize = '28px';
                    el.style.color = '#F5B342';
                };
            });
        })();

        // Закрытие при клике вне карточки
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeProfile();
        });

        var changeBtn = overlay.querySelector('#changeAvatarBtn');
        var avatarInput = overlay.querySelector('#avatarInput');
        var avatarImg = overlay.querySelector('#avatarImg');

        if (changeBtn && avatarInput) changeBtn.addEventListener('click', function() { avatarInput.click(); });
        if (avatarInput) {
            avatarInput.addEventListener('change', function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var imageData = event.target.result;
                        localStorage.setItem('avatar', imageData);
                        if (avatarImg) avatarImg.src = imageData;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        function closeProfile() {
            if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
            if (_profileRenderer) {
                clearCurrentScene();
                _profileRenderer();
                _profileRenderer = null;
                updateButtons();
            }
            _isTransitioning = false;
        }

        var backBtnEl = overlay.querySelector('#profileBackBtn');
        var closeBtnEl = overlay.querySelector('#profileCloseBtn');
        var chestEl = overlay.querySelector('#profileChest');

        if (backBtnEl) backBtnEl.addEventListener('click', closeProfile);
        if (closeBtnEl) closeBtnEl.addEventListener('click', closeProfile);
        if (chestEl) chestEl.addEventListener('click', function() { alert('Здесь будут храниться PDF-файлы с дополнительными материалами.\nСкоро появится!'); });

        // Показываем кнопку назад/скрываем профиль кнопку
        if (_backBtn) _backBtn.style.display = 'flex';
        if (_profileBtn) _profileBtn.style.display = 'none';
    }
    
    function clearCurrentScene() {
        if (!_sceneContent) return;
        var videos = _sceneContent.querySelectorAll('video');
        videos.forEach(function(v) { v.pause(); v.src = ''; try { v.load(); } catch(e){} });
        _sceneContent.innerHTML = '';
        if (typeof AudioManager !== 'undefined' && AudioManager.isPlaying()) AudioManager.stopAll();
    }
    
    function processQueue() {
        if (_transitionQueue.length === 0) return;
        var next = _transitionQueue.shift();
        setTimeout(function() { goTo(next.renderer, next.index, next.series); }, 50);
    }
    
    function updateButtons() {
        if (_backBtn) _backBtn.style.display = (GameState.canGoBack() || _profileRenderer || (window._friendshipSequence && window._friendshipIndex !== undefined)) ? 'flex' : 'none';
        var onMain = !GameState.getCurrentSeries() && !window._friendshipSequence;
        if (_homeBtn) _homeBtn.style.display = onMain ? 'none' : 'flex';
        if (_soundBtn) _soundBtn.style.display = 'flex';
        if (_resetBtn) _resetBtn.style.display = onMain ? 'none' : 'flex';
        if (_profileBtn) _profileBtn.style.display = onMain && GameState.hasChildName() ? 'flex' : 'none';

        var keysBadge = document.getElementById('headerKeysBadge');
        var keysCount = document.getElementById('headerKeysCount');
        if (keysBadge && keysCount) {
            var friendshipDone = GameState.isSeriesCompleted('friendship');
            var careDone = GameState.isSeriesCompleted('care');
            var teamworkDone = GameState.isSeriesCompleted('teamwork');
            var totalKeys = (friendshipDone ? 1 : 0) + (careDone ? 1 : 0) + (teamworkDone ? 1 : 0);
            if (onMain && GameState.hasChildName() && totalKeys > 0) {
                keysBadge.style.display = 'flex'; keysCount.textContent = totalKeys;
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
        goToScene: goToScene,
        goBack: goBack,
        goHome: goHome,
        showProfile: showProfile,
        closeAllPopups: closeAllPopups,
        clearQueue: function() { _transitionQueue = []; },
        updateButtons: updateButtons,
        getRendererBySceneType: getRendererBySceneType
    };
})();
