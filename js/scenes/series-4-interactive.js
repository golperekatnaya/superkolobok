// ========== SERIES-4-INTERACTIVE.JS ==========
// Интерактивная сцена внутри ролика series-4.mp4.
//
// Логика:
//  - 0:00–0:40 — ролик играет, ничего нет
//  - 0:40    — в ролике начинается вопрос (анимация внутри видео)
//  - 0:47    — появляется 1-я кнопка test-btn
//  - 0:49    — появляется 2-я кнопка test-btn
//  - 0:52    — появляется 3-я кнопка test-btn
//  - 0:58    — пауза, все три кнопки кликабельны
//  - клик по 1-й → видео 59→74, стоп, показать repeat-btn
//  - клик по 2-й → видео 76→86, стоп, показать repeat-btn
//  - клик по 3-й → видео 88→160, показать arrow (видео играет до конца)
//  - repeat-btn → вернуться на 0:40, кнопки появятся заново
//  - arrow     → переход к series-5

const Series4Interactive = (function() {
    'use strict';

    // ========== НАСТРОЙКИ ==========
    var CONFIG = {
        // Когда начинается тест (используется только для сброса при repeat)
        testStart: 40,

        // Когда появляются кнопки ответа
        showBtnAt: [47, 49, 52],

        // Где останавливается и ждёт ответа
        pauseAt: 58,

        // Ветки: [start, end, repeat, arrow]
        branches: [
            { start: 59,  end: 74,  repeat: true,  arrow: false },
            { start: 76,  end: 86,  repeat: true,  arrow: false },
            { start: 88,  end: 160, repeat: false, arrow: true  }
        ],

        // Позиции кнопок test-btn (в процентах от размеров видео).
        // Сдвинули влево на 10% (≈ 2,5 см при ширине 900px).
        buttonPositions: [
            { top: '62%', left: '47%' },
            { top: '72%', left: '47%' },
            { top: '82%', left: '47%' }
        ],
        buttonSize: '40px',

        // repeat-btn — левый нижний угол
        repeatPos:  { bottom: '20px', left: '20px' },
        repeatSize: '50px',

        // arrow — правый нижний угол
        arrowPos:  { bottom: '20px', right: '20px' },
        arrowSize: '50px'
    };

    // ========== СОСТОЯНИЕ ==========
    var _video = null;
    var _overlay = null;
    var _buttons = [];
    var _repeatBtn = null;
    var _arrowBtn = null;
    var _buttonsReady = false;
    var _mode = 'waiting';   // 'waiting' | 'in-branch-1' | 'in-branch-2' | 'in-branch-3' | 'done'
    var _created = false;

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

        // Сброс состояния при каждом запуске
        _buttons = [];
        _repeatBtn = null;
        _arrowBtn = null;
        _buttonsReady = false;
        _mode = 'waiting';
        _created = false;

        var wrapper = document.createElement('div');
        wrapper.className = 'video-scene';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';
        wrapper.style.background = '#000';

        _video = document.createElement('video');
        _video.id = 'series4Video';
        _video.preload = 'auto';
        _video.playsInline = true;
        _video.autoplay = true;
        _video.style.width = '100%';
        _video.style.display = 'block';
        try { _video.src = src; } catch (e) {}

        _overlay = document.createElement('div');
        _overlay.id = 'series4Overlay';
        _overlay.style.position = 'absolute';
        _overlay.style.top = '0';
        _overlay.style.left = '0';
        _overlay.style.right = '0';
        _overlay.style.bottom = '0';
        _overlay.style.display = 'block';
        _overlay.style.zIndex = '10';
        _overlay.style.pointerEvents = 'none';

        wrapper.appendChild(_video);
        wrapper.appendChild(_overlay);
        c.appendChild(wrapper);

        // Создаём кнопки ответа сразу, но скрытыми
        createTestButtons();

        // Создаём repeat и arrow — тоже скрытыми
        createRepeatButton();
        createArrowButton();

        _video.addEventListener('timeupdate', onTimeUpdate);
        _video.addEventListener('error', function() {
            if (!_video.isConnected) return;
            console.error('[Series4Interactive] Ошибка загрузки видео');
        });

        _video.currentTime = 0;
        _video.play().catch(function() {
            try { _video.controls = true; } catch (e) {}
        });
    }

    function createTestButtons() {
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
                    if (!_buttonsReady || _mode !== 'waiting') return;
                    onSelectBranch(idx);
                });

                _overlay.appendChild(btn);
                _buttons.push(btn);
            })(i);
        }
    }

    function createRepeatButton() {
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

        var img = document.createElement('img');
        img.src = UI.getImagePath('repeatBtn');
        img.alt = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.pointerEvents = 'none';
        _repeatBtn.appendChild(img);

        _repeatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onRepeatClick();
        });

        _overlay.appendChild(_repeatBtn);
    }

    function createArrowButton() {
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

        var img = document.createElement('img');
        img.src = UI.getImagePath('arrow');
        img.alt = '';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.display = 'block';
        img.style.pointerEvents = 'none';
        _arrowBtn.appendChild(img);

        _arrowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            onArrowClick();
        });

        _overlay.appendChild(_arrowBtn);
    }

    // ========== ОБРАБОТКА ВРЕМЕНИ ==========
    function onTimeUpdate() {
        if (!_video) return;
        var t = _video.currentTime;

        // === В ветке 1 или 2: ждём достижения конца и останавливаемся ===
        if (_mode === 'in-branch-1' || _mode === 'in-branch-2') {
            var brIdx = (_mode === 'in-branch-1') ? 0 : 1;
            var br = CONFIG.branches[brIdx];
            if (t >= br.end - 0.15) {
                _video.pause();
                _mode = 'done';
                showOnlyRepeat();
            }
            return;
        }

        // === В ветке 3: ждём 160 секунд, показываем arrow, но видео продолжает идти ===
        if (_mode === 'in-branch-3') {
            if (t >= CONFIG.branches[2].end - 0.15 && _arrowBtn.style.display === 'none') {
                showOnlyArrow();
                _mode = 'done';
            }
            return;
        }

        // === Обычная часть ролика (не в ветке) ===
        if (_mode === 'waiting') {
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

            // Пауза на 58 — включаем кликабельность
            if (t >= CONFIG.pauseAt && !_buttonsReady) {
                _video.pause();
                _buttonsReady = true;
                _buttons.forEach(function(b) {
                    b.style.pointerEvents = 'auto';
                });
            }
        }
    }

    // ========== ДЕЙСТВИЯ ==========

    function onSelectBranch(index) {
        if (!_buttonsReady) return;

        // Скрываем все три кнопки ответа
        _buttons.forEach(function(b) {
            b.style.display = 'none';
            b.style.pointerEvents = 'none';
        });
        _buttonsReady = false;

        var br = CONFIG.branches[index];
        _video.currentTime = br.start;

        if (index === 0) {
            _mode = 'in-branch-1';
        } else if (index === 1) {
            _mode = 'in-branch-2';
        } else {
            _mode = 'in-branch-3';
        }

        _video.play().catch(function() {});
    }

    function showOnlyRepeat() {
        if (_repeatBtn) {
            _repeatBtn.style.display = 'block';
            _repeatBtn.style.pointerEvents = 'auto';
        }
        if (_arrowBtn) {
            _arrowBtn.style.display = 'none';
            _arrowBtn.style.pointerEvents = 'none';
        }
    }

    function showOnlyArrow() {
        if (_arrowBtn) {
            _arrowBtn.style.display = 'block';
            _arrowBtn.style.pointerEvents = 'auto';
        }
        if (_repeatBtn) {
            _repeatBtn.style.display = 'none';
            _repeatBtn.style.pointerEvents = 'none';
        }
    }

    function onRepeatClick() {
        // Скрываем repeat и arrow
        if (_repeatBtn) { _repeatBtn.style.display = 'none'; _repeatBtn.style.pointerEvents = 'none'; }
        if (_arrowBtn)  { _arrowBtn.style.display  = 'none'; _arrowBtn.style.pointerEvents  = 'none'; }

        // Сбрасываем кнопки ответа в исходное состояние — они снова появятся по таймингу
        _buttons.forEach(function(b) {
            b.style.display = 'none';
            b.style.pointerEvents = 'none';
        });
        _buttonsReady = false;
        _mode = 'waiting';

        // Возвращаемся на начало теста
        _video.currentTime = CONFIG.testStart;
        _video.play().catch(function() {});
    }

    function onArrowClick() {
        if (typeof Navigation !== 'undefined' && typeof SeriesSelect !== 'undefined') {
            Navigation.goTo(SeriesSelect._playSeries5, 1);
        }
    }

    // ========== ПУБЛИЧНЫЙ API ==========
    return {
        render: render
    };
})();