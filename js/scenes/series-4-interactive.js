// ========== SERIES-4-INTERACTIVE.JS ==========
// Интерактивная сцена внутри ролика series-4.mp4:
//  - 0:47, 0:49, 0:52 — по очереди появляются три кнопки test-btn
//  - 0:58 — видео на паузе, все три кнопки кликабельны
//  - по клику: переход на одну из трёх веток
//  - конец ветки 1 (0:59–1:14) → пауза, repeat-btn
//  - конец ветки 2 (1:16–1:27) → пауза, repeat-btn
//  - конец ветки 3 (1:28–2:41) → пауза, arrow
//  - repeat → возвращает на 0:40 (повтор вопроса)
//  - arrow → переход к series-5

const Series4Interactive = (function() {
    'use strict';

    // ========== НАСТРОЙКИ ==========
    // Меняйте только эти значения, когда нужно подкрутить позиции/тайминги.
    var CONFIG = {
        // Тайминги (в секундах)
        replayFrom: 40,            // откуда начинается повтор вопроса (для repeat)
        showBtnAt: [47, 49, 52],   // когда появляются кнопки 1, 2, 3
        pauseAt: 58,               // где ролик останавливается и ждёт ответа

        // Ветки: [начало, конец, показать repeat, показать arrow]
        branches: [
            { start: 59,  end: 74,  repeat: true,  arrow: false },
            { start: 76,  end: 87,  repeat: true,  arrow: false },
            { start: 88,  end: 161, repeat: false, arrow: true  }
        ],

        // Позиции трёх кнопок test-btn (проценты от размера видео)
        buttonPositions: [
            { top: '62%', left: '57%' },
            { top: '72%', left: '57%' },
            { top: '82%', left: '57%' }
        ],
        buttonSize: '40px',

        // Позиция и размер repeat-btn (левый нижний угол)
        repeatPos:  { bottom: '20px', left: '20px' },
        repeatSize: '50px',

        // Позиция и размер arrow (правый нижний угол)
        arrowPos:  { bottom: '20px', right: '20px' },
        arrowSize: '50px'
    };

    // ========== СОСТОЯНИЕ ==========
    var _video = null;
    var _wrapper = null;
    var _buttons = [];        // три кнопки test-btn
    var _repeatBtn = null;
    var _arrowBtn = null;
    var _buttonsReady = false; // кликабельны ли кнопки (только после pauseAt)
    var _currentBranch = -1;   // индекс активной ветки, -1 если не выбрана
    var _isPlayingVideo = false;

    // ========== РЕНДЕР ==========
    function render() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        UI.clearContainer(c);

        var src = GameConfig.getVideo('series-4');
        if (!src) {
            console.error('[Series4Interactive] Не найден series-4');
            c.innerHTML = '<p style="color:#fff;padding:20px;">Видео series-4 не найдено</p>';
            return;
        }

        // Сброс состояния
        _buttons = [];
        _repeatBtn = null;
        _arrowBtn = null;
        _buttonsReady = false;
        _currentBranch = -1;
        _isPlayingVideo = false;

        // Обёртка
        _wrapper = document.createElement('div');
        _wrapper.className = 'video-scene';
        _wrapper.style.position = 'relative';
        _wrapper.style.width = '100%';
        _wrapper.style.background = '#000';

        // Видео
        _video = document.createElement('video');
        _video.id = 'series4Video';
        _video.preload = 'auto';
        _video.playsInline = true;
        _video.autoplay = true;
        _video.style.width = '100%';
        _video.style.display = 'block';
        try { _video.src = src; } catch (e) {}

        // Слой для кнопок
        var overlay = document.createElement('div');
        overlay.id = 'series4Overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.display = 'block';
        overlay.style.zIndex = '10';
        overlay.style.pointerEvents = 'none';

        // Создаём три кнопки test-btn (пока скрытые)
        for (var i = 0; i < 3; i++) {
            (function(idx) {
                var btn = document.createElement('button');
                btn.className = 'scene-btn series4-test-btn';
                btn.style.position = 'absolute';
                btn.style.top = CONFIG.buttonPositions[idx].top;
                btn.style.left = CONFIG.buttonPositions[idx].left;
                btn.style.width = CONFIG.buttonSize;
                btn.style.height = CONFIG.buttonSize;
                btn.style.transform = 'translate(-50%, -50%)';
                btn.style.display = 'none';
                btn.style.pointerEvents = 'none';
                btn.style.zIndex = '30';
                btn.style.background = 'none';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';
                btn.style.padding = '0';

                var img = document.createElement('img');
                img.src = UI.getImagePath('testBtn');
                img.alt = '';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.display = 'block';
                img.style.pointerEvents = 'none';
                btn.appendChild(img);

                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!_buttonsReady) return;
                    selectBranch(idx);
                });

                overlay.appendChild(btn);
                _buttons.push(btn);
            })(i);
        }

        // Кнопка repeat (создаём заранее, пока скрыта)
        _repeatBtn = document.createElement('button');
        _repeatBtn.style.position = 'absolute';
        _repeatBtn.style.bottom = CONFIG.repeatPos.bottom;
        _repeatBtn.style.left = CONFIG.repeatPos.left;
        _repeatBtn.style.width = CONFIG.repeatSize;
        _repeatBtn.style.height = CONFIG.repeatSize;
        _repeatBtn.style.display = 'none';
        _repeatBtn.style.pointerEvents = 'none';
        _repeatBtn.style.zIndex = '30';
        _repeatBtn.style.background = 'none';
        _repeatBtn.style.border = 'none';
        _repeatBtn.style.cursor = 'pointer';
        _repeatBtn.style.padding = '0';
        var repeatImg = document.createElement('img');
        repeatImg.src = UI.getImagePath('repeatBtn');
        repeatImg.alt = '';
        repeatImg.style.width = '100%';
        repeatImg.style.height = '100%';
        repeatImg.style.display = 'block';
        repeatImg.style.pointerEvents = 'none';
        _repeatBtn.appendChild(repeatImg);
        _repeatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onRepeatClick();
        });
        overlay.appendChild(_repeatBtn);

        // Кнопка arrow (создаём заранее, пока скрыта)
        _arrowBtn = document.createElement('button');
        _arrowBtn.style.position = 'absolute';
        _arrowBtn.style.bottom = CONFIG.arrowPos.bottom;
        _arrowBtn.style.right = CONFIG.arrowPos.right;
        _arrowBtn.style.width = CONFIG.arrowSize;
        _arrowBtn.style.height = CONFIG.arrowSize;
        _arrowBtn.style.display = 'none';
        _arrowBtn.style.pointerEvents = 'none';
        _arrowBtn.style.zIndex = '30';
        _arrowBtn.style.background = 'none';
        _arrowBtn.style.border = 'none';
        _arrowBtn.style.cursor = 'pointer';
        _arrowBtn.style.padding = '0';
        var arrowImg = document.createElement('img');
        arrowImg.src = UI.getImagePath('arrow');
        arrowImg.alt = '';
        arrowImg.style.width = '100%';
        arrowImg.style.height = '100%';
        arrowImg.style.display = 'block';
        arrowImg.style.pointerEvents = 'none';
        _arrowBtn.appendChild(arrowImg);
        _arrowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onArrowClick();
        });
        overlay.appendChild(_arrowBtn);

        _wrapper.appendChild(_video);
        _wrapper.appendChild(overlay);
        c.appendChild(_wrapper);

        // Слушаем время
        _video.addEventListener('timeupdate', onTimeUpdate);

        // Ошибка видео
        _video.addEventListener('error', function() {
            if (!_video.isConnected) return;
            console.error('[Series4Interactive] Ошибка загрузки видео');
        });

        // Старт
        _video.currentTime = 0;
        _video.play().catch(function() {
            try { _video.controls = true; } catch (e) {}
        });
    }

    // ========== ОБРАБОТКА ВРЕМЕНИ ==========
    function onTimeUpdate() {
        if (!_video) return;

        var t = _video.currentTime;
        var dur = _video.duration || 0;

        // Если видео в процессе одной из веток
        if (_currentBranch >= 0) {
            var br = CONFIG.branches[_currentBranch];
            if (t >= br.end - 0.15) {
                _video.pause();
                showBranchEnd(_currentBranch);
                _currentBranch = -2; // «ветка завершена, ждём repeat/arrow»
            }
            return;
        }

        // Обычный проход ролика (не в ветке)
        // Показ кнопок по очереди
        if (t >= CONFIG.showBtnAt[0] && _buttons[0].style.display === 'none') {
            _buttons[0].style.display = 'block';
        }
        if (t >= CONFIG.showBtnAt[1] && _buttons[1].style.display === 'none') {
            _buttons[1].style.display = 'block';
        }
        if (t >= CONFIG.showBtnAt[2] && _buttons[2].style.display === 'none') {
            _buttons[2].style.display = 'block';
        }

        // Пауза на pauseAt
        if (t >= CONFIG.pauseAt && !_buttonsReady) {
            _video.pause();
            _buttonsReady = true;
            _buttons.forEach(function(b) {
                b.style.pointerEvents = 'auto';
            });
        }

        // Скрываем repeat/arrow, если их случайно показали и мы снова идём по «основной» линии
        if (_repeatBtn) { _repeatBtn.style.display = 'none'; _repeatBtn.style.pointerEvents = 'none'; }
        if (_arrowBtn)  { _arrowBtn.style.display  = 'none'; _arrowBtn.style.pointerEvents  = 'none'; }
    }

    // ========== ДЕЙСТВИЯ ==========

    function selectBranch(index) {
        if (!_buttonsReady) return;
        if (index < 0 || index >= CONFIG.branches.length) return;

        // Скрываем кнопки
        _buttons.forEach(function(b) {
            b.style.display = 'none';
            b.style.pointerEvents = 'none';
        });
        _buttonsReady = false;

        _currentBranch = index;
        var br = CONFIG.branches[index];

        _video.currentTime = br.start;
        _video.play().catch(function() {});
    }

    function showBranchEnd(branchIndex) {
        var br = CONFIG.branches[branchIndex];
        if (br.repeat && _repeatBtn) {
            _repeatBtn.style.display = 'block';
            _repeatBtn.style.pointerEvents = 'auto';
        }
        if (br.arrow && _arrowBtn) {
            _arrowBtn.style.display = 'block';
            _arrowBtn.style.pointerEvents = 'auto';
        }
    }

    function onRepeatClick() {
        // Скрываем repeat/arrow
        if (_repeatBtn) { _repeatBtn.style.display = 'none'; _repeatBtn.style.pointerEvents = 'none'; }
        if (_arrowBtn)  { _arrowBtn.style.display  = 'none'; _arrowBtn.style.pointerEvents  = 'none'; }

        // Сбрасываем состояние кнопок — они покажутся снова по таймингу
        _buttons.forEach(function(b) {
            b.style.display = 'none';
            b.style.pointerEvents = 'none';
        });
        _buttonsReady = false;
        _currentBranch = -1;

        _video.currentTime = CONFIG.replayFrom;
        _video.play().catch(function() {});
    }

    function onArrowClick() {
        // Переход к series-5
        if (typeof Navigation !== 'undefined') {
            Navigation.goTo(SeriesSelect._playSeries5, 1);
        }
    }

    // ========== ПУБЛИЧНЫЙ API ==========
    return {
        render: render
    };
})();