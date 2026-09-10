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
    var _lastSoundToggleTs = 0;

    // Список доступных аватаров. Чтобы добавить нового персонажа —
    // просто добавьте строку с путём к картинке.
    var AVATARS = [
        'media/images/kolobok_avatar.png',
        'media/images/ejik_tonya.png'
    ];
    var DEFAULT_AVATAR = AVATARS[0];

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
            _profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (!_isTransitioning) showProfile();
            });
            _profileBtn.style.display = 'none';
        }

        if (_soundBtn) {
            _soundBtn.addEventListener('click', function() {
                var now = Date.now();
                if (now - _lastSoundToggleTs < 400) return;
                _lastSoundToggleTs = now;
                if (typeof AudioManager !== 'undefined') {
                    AudioManager.toggleMute();
                    try { AudioManager.updateSoundIcon(!AudioManager.isMuted()); } catch (e) {}
                }
            });
        }

        if (_resetBtn) {
            _resetBtn.addEventListener('click', function(e) { e.preventDefault(); goHome(); });
        }

        _isInitialized = true;
        return true;
    }

    // ========== ФЛАГИ ПОДАВЛЕНИЯ ОШИБОК ВИДЕО ==========
    function suppressVideoErrors() {
        try {
            var activeVideos = document.querySelectorAll('#sceneContent video');
            activeVideos.forEach(function(v) {
                try { v.dataset.isIntentionalReset = '1'; } catch (e) {}
            });
            window.__sequenceVideoTransition = true;
            window.__careSequenceVideoTransition = true;
        } catch (e) {}
    }

    function resetSuppressFlags() {
        window.__sequenceVideoTransition = false;
        window.__careSequenceVideoTransition = false;
    }

    // ========== ПЕРЕХОДЫ ==========
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

        suppressVideoErrors();

        if (window._careSequence && window._careIndex !== undefined) {
            if (window._careIndex > 0) {
                var prevCareIndex = window._careIndex - 1;
                if (typeof SeriesSelect !== 'undefined' && SeriesSelect._playCareSequenceStep) {
                    SeriesSelect._playCareSequenceStep(window._careSequence, prevCareIndex);
                } else {
                    window._careIndex = 0;
                    if (typeof SeriesSelect !== 'undefined' && SeriesSelect._restartCareSequence) SeriesSelect._restartCareSequence();
                }
                return;
            } else {
                window._careSequence = null;
                window._careIndex = 0;
                goTo(SeriesSelect.render, 1);
                return;
            }
        }

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

        suppressVideoErrors();

        window._friendshipSequence = null;
        window._friendshipIndex = 0;
        window._careSequence = null;
        window._careIndex = 0;
        closeAllPopups();
        if (typeof AudioManager !== 'undefined') AudioManager.stopAll();
        _currentRenderer = null;
        GameState.setCurrentSeries(null);
        _isTransitioning = true;
        clearCurrentScene();
        resetSuppressFlags();
        SeriesSelect.render();
        updateButtons();
        _isTransitioning = false;
    }

    // ========== ПРОФИЛЬ ==========
    function showProfile() {
        if (_isTransitioning) return;

        // Профиль можно открывать ТОЛЬКО на экране серий.
        // Если сейчас идёт серия / ролик / игра — не открываем.
        if (GameState.getCurrentSeries() || window._friendshipSequence || window._careSequence) {
            return;
        }

        // Запоминаем, что вернуть при закрытии профиля
        var previousRenderer = _currentRenderer;

        _isTransitioning = true;

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

        // Текущий аватар
        var savedAvatar = localStorage.getItem('avatar');
        if (!savedAvatar || AVATARS.indexOf(savedAvatar) === -1) {
            savedAvatar = DEFAULT_AVATAR;
        }

        // Карточки выбора аватара
        var avatarsHtml = '';
        AVATARS.forEach(function(path) {
            var selected = (path === savedAvatar) ? ' selected' : '';
            avatarsHtml +=
                '<button class="avatar-choice' + selected + '" data-avatar="' + path + '" type="button">' +
                    '<img src="' + path + '" alt="">' +
                '</button>';
        });

        var overlay = document.createElement('div');
        overlay.id = 'profileOverlay';
        overlay.className = 'game-popup-overlay';
        overlay.innerHTML =
            '<div class="profile-card">' +
                '<button class="popup-close-btn profile-close-btn" id="profileCloseBtn" type="button">&times;</button>' +
                '<div class="profile-avatar" id="profileAvatar"><img src="' + savedAvatar + '" alt="Аватар" id="avatarImg"></div>' +
                '<div class="profile-section-title">Выбери персонажа</div>' +
                '<div class="avatars-grid" id="avatarsGrid">' + avatarsHtml + '</div>' +
                '<div class="profile-name">' + name + '</div>' +
                '<div class="profile-stars">' +
                    '<span>' + (stars >= 1 ? '★' : '☆') + '</span>' +
                    '<span>' + (stars >= 2 ? '★' : '☆') + '</span>' +
                    '<span>' + (stars >= 3 ? '★' : '☆') + '</span>' +
                '</div>' +
                '<div class="profile-keys-count"><img src="media/images/key-icon.png" alt="" style="width:24px;height:24px;"><span>' + totalKeys + ' / 3</span></div>' +
                '<div class="profile-section-title">Награды</div>' +
                '<div class="medals-grid">' + medalsHtml + '</div>' +
                '<div class="profile-chest" id="profileChest"><div class="profile-chest-icon">&#128451;</div><div>Сундук с материалами</div></div>' +
                '<button class="profile-back-btn" id="profileBackBtn" type="button">Назад</button>' +
            '</div>';

        document.body.appendChild(overlay);

        // Фоллбэк, если картинка медали не загрузилась
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

        // Клик по фону — закрыть
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeProfile();
        });

        // Обработчики выбора аватара
        var avatarImg = overlay.querySelector('#avatarImg');
        var avatarButtons = overlay.querySelectorAll('.avatar-choice');
        avatarButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var chosen = btn.getAttribute('data-avatar');
                if (!chosen) return;
                // Сохраняем
                try { localStorage.setItem('avatar', chosen); } catch (e) {}
                // Обновляем большое превью
                if (avatarImg) avatarImg.src = chosen;
                // Обновляем подсветку
                avatarButtons.forEach(function(b) { b.classList.remove('selected'); });
                btn.classList.add('selected');
            });
        });

        // Закрытие профиля
        function closeProfile() {
            try {
                if (overlay && overlay.parentElement) {
                    overlay.parentElement.removeChild(overlay);
                }
            } catch (e) {
                console.warn('[Nav] Не удалось закрыть профиль:', e);
            }

            // Возвращаем предыдущую сцену
            try {
                if (typeof previousRenderer === 'function') {
                    clearCurrentScene();
                    previousRenderer();
                }
            } catch (e) {
                console.warn('[Nav] Не удалось вернуть сцену:', e);
                // Если что-то пошло не так — на всякий случай на экран серий
                try { SeriesSelect.render(); } catch (e2) {}
            }

            updateButtons();
            _isTransitioning = false;
        }

        var backBtnEl = overlay.querySelector('#profileBackBtn');
        var closeBtnEl = overlay.querySelector('#profileCloseBtn');
        var chestEl = overlay.querySelector('#profileChest');

        if (backBtnEl) backBtnEl.addEventListener('click', closeProfile);
        if (closeBtnEl) closeBtnEl.addEventListener('click', closeProfile);

        // Сундук с материалами
        if (chestEl) chestEl.addEventListener('click', function() {
            var materials = [];
            try { materials = (typeof GameState !== 'undefined') ? GameState.getMaterials() : []; } catch (e) { materials = []; }

            var overlay2 = document.createElement('div');
            overlay2.className = 'game-popup-overlay';
            overlay2.style.opacity = '0';
            overlay2.style.transition = 'opacity 0.2s ease';

            var popup2 = document.createElement('div');
            popup2.className = 'game-popup';
            popup2.style.maxWidth = '480px';
            popup2.style.textAlign = 'center';
            popup2.innerHTML = '<h3 style="color:#C68B3C;margin-bottom:12px;font-size:1rem;">Сундук с материалами</h3>';

            if (!materials || materials.length === 0) {
                popup2.innerHTML += '<p style="color:#666;margin-bottom:12px;">Пока сундук пуст — материалы появятся после прохождения серий.</p>';
            } else {
                var list = document.createElement('div');
                list.style.display = 'flex';
                list.style.flexDirection = 'column';
                list.style.gap = '10px';
                materials.forEach(function(m) {
                    var row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.justifyContent = 'space-between';
                    row.style.alignItems = 'center';
                    row.style.padding = '8px 12px';
                    row.style.background = '#FFF8F0';
                    row.style.borderRadius = '10px';

                    var nameEl = document.createElement('div');
                    nameEl.textContent = m;
                    nameEl.style.color = '#4A3724';
                    nameEl.style.fontWeight = '600';
                    nameEl.style.fontSize = '0.9rem';

                    var btn = document.createElement('button');
                    btn.textContent = 'Скачать';
                    btn.style.background = '#F5B342';
                    btn.style.color = 'white';
                    btn.style.border = 'none';
                    btn.style.padding = '6px 12px';
                    btn.style.borderRadius = '20px';
                    btn.style.cursor = 'pointer';
                    btn.addEventListener('click', function() {
                        window.open('media/bonus/' + m, '_blank');
                    });

                    row.appendChild(nameEl);
                    row.appendChild(btn);
                    list.appendChild(row);
                });
                popup2.appendChild(list);
            }

            var closeBtn2 = document.createElement('button');
            closeBtn2.className = 'profile-back-btn';
            closeBtn2.textContent = 'Закрыть';
            closeBtn2.style.marginTop = '14px';
            closeBtn2.addEventListener('click', function() {
                if (overlay2.parentElement) overlay2.parentElement.removeChild(overlay2);
            });
            popup2.appendChild(closeBtn2);

            overlay2.appendChild(popup2);
            document.body.appendChild(overlay2);
            requestAnimationFrame(function() { overlay2.style.opacity = '1'; });
        });

        updateButtons();
    }

    function clearCurrentScene() {
        if (!_sceneContent) return;
        var videos = _sceneContent.querySelectorAll('video');
        videos.forEach(function(v) {
            try { v.dataset.isIntentionalReset = '1'; } catch (e) {}
            try { v.pause(); } catch (e) {}
            try { v.removeAttribute('src'); } catch (e) {}
            try { v.load(); } catch (e) {}
        });
        _sceneContent.innerHTML = '';
        if (typeof AudioManager !== 'undefined' && AudioManager.isPlaying()) AudioManager.stopAll();
    }

    function processQueue() {
        if (_transitionQueue.length === 0) return;
        var next = _transitionQueue.shift();
        setTimeout(function() { goTo(next.renderer, next.index, next.series); }, 50);
    }

    // ========== ВИДИМОСТЬ КНОПОК ==========
    function updateButtons() {
        var inSeries = !!GameState.getCurrentSeries() || !!window._friendshipSequence || !!window._careSequence;
        var onMain = !inSeries;                 // экран серий или экран имени
        var inProfile = !!document.getElementById('profileOverlay');

        // Назад: показываем, если есть куда назад и мы не на главной
        if (_backBtn) {
            var canBack = (GameState.canGoBack() || inSeries) && !inProfile;
            _backBtn.style.display = canBack ? 'flex' : 'none';
        }

        // Домой: показываем только вне главного экрана
        if (_homeBtn) {
            _homeBtn.style.display = (inSeries && !inProfile) ? 'flex' : 'none';
        }

        // Профиль: только на главном экране (выбор серий), есть имя, не в серии, не в профиле
        if (_profileBtn) {
            var showProfileBtn = onMain && GameState.hasChildName() && !inProfile;
            _profileBtn.style.display = showProfileBtn ? 'flex' : 'none';
        }

        // Звук: всегда
        if (_soundBtn) _soundBtn.style.display = 'flex';

        // Reset (Пройти заново): только на главном экране, не в профиле
        if (_resetBtn) {
            _resetBtn.style.display = (onMain && GameState.hasChildName() && !inProfile) ? 'flex' : 'none';
        }

        // Бейдж с ключиками
        var keysBadge = document.getElementById('headerKeysBadge');
        var keysCount = document.getElementById('headerKeysCount');
        if (keysBadge && keysCount) {
            var friendshipDone = GameState.isSeriesCompleted('friendship');
            var careDone = GameState.isSeriesCompleted('care');
            var teamworkDone = GameState.isSeriesCompleted('teamwork');
            var totalKeys = (friendshipDone ? 1 : 0) + (careDone ? 1 : 0) + (teamworkDone ? 1 : 0);
            if (onMain && GameState.hasChildName() && totalKeys > 0 && !inProfile) {
                keysBadge.style.display = 'flex';
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