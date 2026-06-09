// ========== FINALE.JS ==========

const Finale = (function() {
    'use strict';
    
    function render1() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(22);
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo('finale1');
        c.innerHTML = 
            '<div class="video-scene">' +
                '<video id="finale1Video" preload="auto" playsinline controls>' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div class="video-overlay" id="btnOverlay"></div>' +
            '</div>';
        
        var v = document.getElementById('finale1Video');
        var o = document.getElementById('btnOverlay');
        if (!v) return;
        
        var btn = UI.createSceneButton('castleBtn', 'glow', function() {
            Navigation.goTo(render2, 23);
        });
        
        function setupTimer() {
            var t = v.duration - 4;
            if (t < 0) t = 0;
            v.addEventListener('timeupdate', function check() {
                if (v.currentTime >= t) {
                    v.removeEventListener('timeupdate', check);
                    if (!o.querySelector('.scene-btn')) {
                        o.appendChild(btn);
                        o.classList.add('visible');
                    }
                }
            });
            if (v.currentTime >= t) {
                if (!o.querySelector('.scene-btn')) {
                    o.appendChild(btn);
                    o.classList.add('visible');
                }
            }
        }
        
        if (v.readyState >= 1) setupTimer();
        else v.addEventListener('loadedmetadata', setupTimer);
        
        v.addEventListener('ended', function() {
            if (!o.querySelector('.scene-btn')) {
                o.appendChild(btn);
                o.classList.add('visible');
            }
        });
        v.addEventListener('error', function() {
            if (!o.querySelector('.scene-btn')) {
                o.appendChild(btn);
                o.classList.add('visible');
            }
        });
        
        v.play().catch(function() {
            v.controls = true;
            if (!o.querySelector('.scene-btn')) {
                o.appendChild(btn);
                o.classList.add('visible');
            }
        });
    }
    
    function render2() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(23);
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo('finale2');
        c.innerHTML = 
            '<div class="video-scene">' +
                '<video id="finale2Video" preload="auto" playsinline controls>' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
            '</div>';
        
        var v = document.getElementById('finale2Video');
        if (!v) return;
        
        v.addEventListener('ended', function() {
            GameState.completeSeries('teamwork');
            Popup.openConfirmPopup({
                title: 'Поздравляем!',
                message: 'Вы прошли серию "Сила команды"! Вернуться к выбору серий?',
                confirmText: 'К выбору серий',
                cancelText: 'Остаться',
                onConfirm: function() { Navigation.goTo(SeriesSelect.render, 1); }
            });
        });
        
        v.play().catch(function() { v.controls = true; });
    }
    
    return { render1, render2 };
})();