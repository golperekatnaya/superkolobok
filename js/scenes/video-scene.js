// ========== VIDEO-SCENE.JS ==========

const VideoScene = (function() {
    'use strict';
    
    function renderVideoSceneManual(vk, bk, cls, before, nextFn, sceneIdx, isImg) {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(sceneIdx);
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo(vk);
        var name = GameState.getChildName();
        var bannerHtml = (vk === 'intro' && name) ? '<div class="name-banner">Здравствуй, ' + name + '!</div>' : '';
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;">' +
                bannerHtml +
                '<video id="sceneVideo" preload="auto" playsinline style="width:100%;display:block;">' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div id="btnOverlay" style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);z-index:100;opacity:0;pointer-events:none;display:flex;align-items:center;justify-content:center;gap:10px;"></div>' +
            '</div>';
        
        var v = document.getElementById('sceneVideo');
        var o = document.getElementById('btnOverlay');
        if (!v) return;
        
        v.addEventListener('click', function() {
            if (v.paused) {
                v.play().catch(function(){});
            } else {
                v.pause();
            }
        });
        
        if (bk) {
            var btn = UI.createSceneButton(bk, cls || '', function() {
                if (nextFn) Navigation.goTo(nextFn, sceneIdx);
            });
            
            v.addEventListener('loadedmetadata', function() {
                var t = v.duration - (before || 3);
                if (t < 0) t = 0;
                v.addEventListener('timeupdate', function tc() {
                    if (v.currentTime >= t) {
                        o.appendChild(btn);
                        o.style.opacity = '1';
                        o.style.pointerEvents = 'auto';
                        v.removeEventListener('timeupdate', tc);
                    }
                });
            });
        } else {
            v.addEventListener('ended', function() {
                if (nextFn) Navigation.goTo(nextFn, sceneIdx);
            });
        }
        
        v.play().catch(function() {});
    }
    
    // ========== НОВАЯ ФУНКЦИЯ ДЛЯ ИНТЕРАКТИВНОГО ВИДЕО ==========
    function renderInteractiveVideo(videoKey, pauseTime, resumeTime, buttonKey, buttonClass, nextFn, sceneIdx) {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.update(sceneIdx);
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo(videoKey);
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;">' +
                '<video id="interactiveVideo" preload="auto" playsinline style="width:100%;display:block;">' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div id="btnOverlay" style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);z-index:100;opacity:0;pointer-events:none;">' +
                '</div>' +
            '</div>';
        
        var video = document.getElementById('interactiveVideo');
        var btnOverlay = document.getElementById('btnOverlay');
        
        // Создаём кнопку
        var btn = UI.createSceneButton(buttonKey, buttonClass, function() {
            // При нажатии: скрываем кнопку, перескакиваем на resumeTime, продолжаем видео
            btnOverlay.style.opacity = '0';
            btnOverlay.style.pointerEvents = 'none';
            video.currentTime = resumeTime;
            video.play().catch(function() {});
            
            // Убираем обработчик остановки
            video.removeEventListener('timeupdate', pauseHandler);
        });
        
        btnOverlay.appendChild(btn);
        
        // Следим за временем видео
        function pauseHandler() {
            if (video.currentTime >= pauseTime && video.currentTime < pauseTime + 0.5) {
                video.pause();
                btnOverlay.style.opacity = '1';
                btnOverlay.style.pointerEvents = 'auto';
                video.removeEventListener('timeupdate', pauseHandler);
            }
        }
        
        video.addEventListener('loadedmetadata', function() {
            video.addEventListener('timeupdate', pauseHandler);
        });
        
        // Если видео уже загружено
        if (video.readyState >= 2) {
            if (video.currentTime >= pauseTime) {
                video.pause();
                btnOverlay.style.opacity = '1';
                btnOverlay.style.pointerEvents = 'auto';
            } else {
                video.addEventListener('timeupdate', pauseHandler);
            }
        }
        
        // Обработчик окончания видео (если не нажали кнопку)
        video.addEventListener('ended', function() {
            if (nextFn) Navigation.goTo(nextFn, sceneIdx);
        });
        
        video.play().catch(function() {});
    }
    
    // Специальная функция для песочницы (мульт-игра 1)
    function renderSandboxInteractive() {
        renderInteractiveVideo('sandbox', 28.58, 29.05, 'lamp', 'glow', function() {
            Game1.renderIntro();
        }, 7);
    }
    
    function renderIntro() { renderVideoSceneManual('intro', 'lamp', 'glow', 3, function() { renderGreeting(); }, 2, true); }
    function renderGreeting() { renderVideoSceneManual('greeting', 'mapBtn', '', 3, function() { renderInstruction(); }, 3, true); }
    function renderInstruction() { renderVideoSceneManual('instruction', 'footprintsBtn', '', 4, function() { renderKindergarten(); }, 4, true); }
    function renderKindergarten() { renderVideoSceneManual('kindergarten', 'shovelBtn', '', 4, function() { HintScreen.render1(); }, 5, true); }
    function renderSandbox() { renderVideoSceneManual('sandbox', 'questionBtn', 'glow', 4, function() { Game1.renderIntro(); }, 7, true); }
    function renderStarReward1() { renderVideoSceneManual('starReward', 'arrowBtn', '', 3, function() { Test.render(); }, 10, true); }
    function renderStarReward2() { renderVideoSceneManual('starReward2', 'arrowBtn', '', 3, function() { renderMamaBear(); }, 15, true); }
    function renderMamaBear() { renderVideoSceneManual('mamaBearReturns', 'strawberryBtn', 'glow', 4, function() { HintScreen.render3(); }, 16, true); }
    function renderStarReward3() { renderVideoSceneManual('starReward3', 'arrowBtn', 'glow', 3, function() { renderWayHome(); }, 20, true); }
    function renderWayHome() { renderVideoSceneManual('wayHome', 'arrowBtn', 'glow', 4, function() { Finale.render1(); }, 21, true); }
    function renderDinnerSuccess() { renderVideoSceneManual('dinnerSuccess', null, '', 0, function() { showMamaBearPraise(); }, 19, false); }
    function showMamaBearPraise() { renderVideoSceneManual('mamaBearPraise', null, '', 0, function() { renderStarVideo3(); }, 20, false); }
    function renderStarVideo3() { GameState.addStar(); renderVideoSceneManual('starReward3', 'arrowBtn', 'glow', 3, function() { renderWayHome(); }, 20, true); }
    
    function renderFinale1() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(22);
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo('finale1');
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;">' +
                '<video id="sceneVideo" preload="auto" playsinline style="width:100%;display:block;">' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div id="btnOverlay" style="position:absolute;bottom:60px;left:50%;transform:translateX(-50%);z-index:100;opacity:0;pointer-events:none;"></div>' +
            '</div>';
        
        var v = document.getElementById('sceneVideo');
        var o = document.getElementById('btnOverlay');
        if (!v) return;
        
        v.addEventListener('click', function() {
            if (v.paused) { v.play().catch(function(){}); }
            else { v.pause(); }
        });
        
        var btn = UI.createSceneButton('castleBtn', 'glow', function() {
            Navigation.goTo(function() { renderFinale2(); }, 23);
        });
        
        var shown = false;
        function showBtn() {
            if (shown) return;
            shown = true;
            o.appendChild(btn);
            o.style.opacity = '1';
            o.style.pointerEvents = 'auto';
        }
        
        v.addEventListener('loadedmetadata', function() {
            var triggerTime = v.duration - 3;
            if (triggerTime < 0) triggerTime = v.duration * 0.85;
            
            v.addEventListener('timeupdate', function check() {
                if (v.currentTime >= triggerTime) {
                    v.removeEventListener('timeupdate', check);
                    showBtn();
                }
            });
        });
        
        v.play().catch(function() {});
    }
    
    function renderFinale2() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(23);
        UI.clearContainer(c);
        c.innerHTML = '<div class="video-scene"><video id="finale2Video" preload="auto" playsinline style="width:100%;display:block;"><source src="' + GameConfig.getVideo('finale2') + '" type="video/mp4"></video></div>';
        var v = document.getElementById('finale2Video');
        if (!v) return;
        v.addEventListener('click', function() { if (v.paused) v.play().catch(function(){}); else v.pause(); });
        v.addEventListener('ended', function() {
            GameState.completeSeries('teamwork');
            Popup.openConfirmPopup({ title: 'Поздравляем!', message: 'Вы прошли серию "Сила команды"! Вернуться?', confirmText: 'К выбору', cancelText: 'Остаться', onConfirm: function() { Navigation.goTo(SeriesSelect.render, 1); } });
        });
        v.play().catch(function() { v.controls = true; });
    }
    
    return {
        renderIntro, renderGreeting, renderInstruction, renderKindergarten,
        renderSandbox, renderSandboxInteractive, renderStarReward1, renderStarReward2,
        renderMamaBear, renderStarReward3, renderWayHome,
        renderDinnerSuccess, showMamaBearPraise, renderFinale1, renderFinale2,
        renderVideoSceneManual, renderInteractiveVideo
    };
})();