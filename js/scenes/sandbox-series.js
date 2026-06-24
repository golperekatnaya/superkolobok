// ========== SANDBOX-SERIES.JS ==========
// Серия из 8 мини-роликов для мульт-игры 1 (песочница)

const SandboxSeries = (function() {
    'use strict';
    
    var choice = null; // 'help' или 'ignore'
    
    // Список роликов
    var steps = [
        { video: 'series-1', type: 'auto' },
        { video: 'series-2', type: 'auto' },
        { video: 'series-3', type: 'choice' }, // здесь появляется выбор
        { video: 'series-4', type: 'auto', condition: 'help' },
        { video: 'series-5', type: 'auto', condition: 'ignore' },
        { video: 'series-6', type: 'auto' },
        { video: 'series-7', type: 'auto' },
        { video: 'series-8', type: 'auto' }
    ];
    
    function render() {
        choice = null;
        playStep(0);
    }
    
    function playStep(index) {
        // Если все ролики закончились → переходим к игре
        if (index >= steps.length) {
            Navigation.goTo(Game1.renderIntro, 8);
            return;
        }
        
        var step = steps[index];
        var videoKey = step.video;
        
        // Если у шага есть условие, проверяем выбор
        if (step.condition && step.condition !== choice) {
            playStep(index + 1);
            return;
        }
        
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        
        var src = GameConfig.getVideo(videoKey);
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;">' +
                '<video id="sandboxVideo" preload="auto" playsinline autoplay style="width:100%;display:block;">' +
                    '<source src="' + src + '" type="video/mp4">' +
                '</video>' +
                '<div id="choiceOverlay" style="position:absolute;bottom:80px;left:0;right:0;display:none;justify-content:center;gap:20px;z-index:10;padding:0 20px;">' +
                    '<button class="choice-btn" data-choice="help" style="background:#F5B342;border:none;padding:14px 28px;border-radius:50px;font-size:1rem;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(245,180,66,0.3);">Помочь</button>' +
                    '<button class="choice-btn" data-choice="ignore" style="background:#B0B0B0;border:none;padding:14px 28px;border-radius:50px;font-size:1rem;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.1);">Не мешать</button>' +
                '</div>' +
            '</div>';
        
        var video = document.getElementById('sandboxVideo');
        var choiceOverlay = document.getElementById('choiceOverlay');
        
        // Если это шаг с выбором — показываем кнопки
        if (step.type === 'choice') {
            choiceOverlay.style.display = 'flex';
            
            document.querySelectorAll('.choice-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    choice = btn.dataset.choice;
                    choiceOverlay.style.display = 'none';
                    playStep(index + 1);
                });
            });
        }
        
        // Когда видео закончилось
        video.addEventListener('ended', function() {
            if (step.type === 'choice') {
                // Ждём выбора
                return;
            }
            playStep(index + 1);
        });
        
        // Ошибка загрузки видео
        video.addEventListener('error', function() {
            console.error('Video error:', videoKey);
            playStep(index + 1);
        });
        
        // Автовоспроизведение
        video.play().catch(function() {
            video.controls = true;
        });
    }
    
    return {
        render: render
    };
})();