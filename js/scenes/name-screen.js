// ========== NAME-SCREEN.JS ==========

const NameScreen = (function() {
    'use strict';
    
    var letterSounds = {
        'А': 'letter-a', 'Б': 'letter-be', 'В': 'letter-ve', 'Г': 'letter-ge',
        'Д': 'letter-de', 'Е': 'letter-ye', 'Ё': 'letter-yo', 'Ж': 'letter-zhe',
        'З': 'letter-ze', 'И': 'letter-i', 'Й': 'letter-i-kratkoe', 'К': 'letter-ka',
        'Л': 'letter-el', 'М': 'letter-em', 'Н': 'letter-en', 'О': 'letter-o',
        'П': 'letter-pe', 'Р': 'letter-er', 'С': 'letter-es', 'Т': 'letter-te',
        'У': 'letter-u', 'Ф': 'letter-ef', 'Х': 'letter-ha', 'Ц': 'letter-tse',
        'Ч': 'letter-che', 'Ш': 'letter-sha', 'Щ': 'letter-scha', 'Ъ': 'letter-tvyordiy-znak',
        'Ы': 'letter-yery', 'Ь': 'letter-myagkiy-znak', 'Э': 'letter-e', 'Ю': 'letter-yu', 'Я': 'letter-ya'
    };
    
    var letterPaths = {};
    
    function cacheLetterPaths() {
        Object.values(letterSounds).forEach(function(key) {
            if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
                letterPaths[key] = GameConfig.getSfx(key) || GameConfig.getAudio(key) || '';
            }
        });
    }
    
    function playLetterSound(letter) {
        var key = letterSounds[letter];
        if (!key) return;
        var src = letterPaths[key];
        if (!src) return;
        var a = new Audio(src);
        a.volume = 1.0;
        a.play().catch(function() {});
    }
    
    function render(options) {
        options = options || {};
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.hide();
        UI.clearContainer(c);
        cacheLetterPaths();
        
        var letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
        var currentName = (options.initialName || '').slice(0, 32);
        var isConfirmed = false;
        
        c.innerHTML = 
            '<div class="name-screen">' +
                '<div class="name-top" id="nameTop">' +
                    '<div class="name-firefly name-firefly-big" id="nameFireflyContainer"></div>' +
                    '<div class="name-greeting-text" id="nameGreetingText"></div>' +
                '</div>' +
                '<div class="name-bottom" id="nameBottom">' +
                    '<div class="name-display placeholder" id="nameDisplay">Твоё имя</div>' +
                    '<div class="cubes-grid" id="cubesGrid"></div>' +
                    '<label class="name-manual-label" for="nameManualInput">Или напиши имя с клавиатуры</label>' +
                    '<input class="name-manual-input" id="nameManualInput" type="text" maxlength="32" autocomplete="given-name" aria-label="Имя ребёнка">' +
                    (typeof options.onCancel === 'function' ? '<button class="universe-text-button name-cancel" id="btnCancelName" type="button">← Вернуться к карте</button>' : '') +
                    '<div class="name-actions">' +
                        '<button class="btn-action-icon danger" id="btnClear" title="Стереть">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#C88060" stroke-width="2" stroke-linecap="round"/><path d="M10 11v6M14 11v6" stroke="#C88060" stroke-width="1.5" stroke-linecap="round"/></svg>' +
                        '</button>' +
                        '<button class="btn-action-icon primary" id="btnConfirm" disabled title="Вперёд">' +
                            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        
        var fireflyContainer = document.getElementById('nameFireflyContainer');
        fireflyContainer.appendChild(UI.createClickableFirefly(100, 'nameGreeting'));
        
        var top = document.getElementById('nameTop');
        var bottom = document.getElementById('nameBottom');
        var display = document.getElementById('nameDisplay');
        var grid = document.getElementById('cubesGrid');
        var btnClear = document.getElementById('btnClear');
        var btnConfirm = document.getElementById('btnConfirm');
        var manualInput = document.getElementById('nameManualInput');
        var btnCancelName = document.getElementById('btnCancelName');
        var greetingText = document.getElementById('nameGreetingText');
        
        // Изначально bottom скрыт
        manualInput.value = currentName;
        bottom.style.opacity = '0';
        bottom.style.transform = 'translateY(30px)';
        bottom.style.transition = 'all 0.6s ease';
        
        letters.forEach(function(letter) {
            var cube = document.createElement('button');
            cube.type = 'button';
            cube.className = 'cube';
            cube.textContent = letter;
            cube.addEventListener('click', function() {
                if (isConfirmed) return;
                playLetterSound(letter);
                if (currentName.length < 32) {
                    currentName += letter;
                    manualInput.value = currentName;
                    updateDisplay();
                }
            });
            grid.appendChild(cube);
        });
        updateDisplay();
        
        function updateDisplay() {
            if (!currentName) {
                display.innerHTML = '';
                display.textContent = 'Твоё имя';
                display.classList.add('placeholder');
                btnConfirm.disabled = true;
            } else {
                display.classList.remove('placeholder');
                btnConfirm.disabled = false;
                display.innerHTML = '';
                currentName.split('').forEach(function(letter, index) {
                    var piece = document.createElement('span');
                    piece.className = 'name-letter-piece';
                    var value = document.createElement('b'); value.textContent = letter === ' ' ? '·' : letter; piece.appendChild(value);
                    if (!isConfirmed) {
                        if (index > 0) {
                            var left = document.createElement('button'); left.type = 'button'; left.className = 'name-letter-move'; left.textContent = '←'; left.setAttribute('aria-label', 'Переместить букву ' + letter + ' влево');
                            left.addEventListener('click', function() { moveLetter(index, index - 1); }); piece.appendChild(left);
                        }
                        if (index < currentName.length - 1) {
                            var right = document.createElement('button'); right.type = 'button'; right.className = 'name-letter-move'; right.textContent = '→'; right.setAttribute('aria-label', 'Переместить букву ' + letter + ' вправо');
                            right.addEventListener('click', function() { moveLetter(index, index + 1); }); piece.appendChild(right);
                        }
                        var remove = document.createElement('button'); remove.type = 'button'; remove.className = 'name-letter-remove'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Удалить букву ' + letter);
                        remove.addEventListener('click', function() { removeLetter(index); }); piece.appendChild(remove);
                    }
                    display.appendChild(piece);
                });
            }
        }

        function moveLetter(from, to) {
            var chars = currentName.split(''); var moving = chars.splice(from, 1)[0]; chars.splice(to, 0, moving); currentName = chars.join('');
            manualInput.value = currentName; updateDisplay();
        }

        function removeLetter(index) {
            var chars = currentName.split(''); chars.splice(index, 1); currentName = chars.join('');
            manualInput.value = currentName; updateDisplay();
        }

        manualInput.addEventListener('input', function() {
            if (isConfirmed) return;
            currentName = manualInput.value.slice(0, 32);
            if (manualInput.value !== currentName) manualInput.value = currentName;
            updateDisplay();
        });
        if (btnCancelName) btnCancelName.addEventListener('click', options.onCancel);
        
        btnClear.addEventListener('click', function() {
            if (isConfirmed) return;
            currentName = '';
            manualInput.value = '';
            updateDisplay();
        });
        
        btnConfirm.addEventListener('click', function() {
            if (!currentName.trim() || isConfirmed) return;
            currentName = currentName.trim();
            manualInput.value = currentName;
            isConfirmed = true;
            GameState.setChildName(currentName);
            btnConfirm.disabled = true;
            btnClear.style.opacity = '0.5';
            btnClear.style.pointerEvents = 'none';
            grid.querySelectorAll('.cube').forEach(function(cu) {
                cu.style.opacity = '0.5';
                cu.style.pointerEvents = 'none';
            });
            setTimeout(function() {
                if (typeof options.onComplete === 'function') options.onComplete(currentName);
                else Navigation.goTo(SeriesSelect.render, 1);
            }, 300);
        });
        
        // === ПРИВЕТСТВЕННЫЙ ТЕКСТ И ЗВУК ПАРАЛЛЕЛЬНО ===
        var name = GameState.getChildName() || '';
        var helloText = name ? 'С возвращением, ' + name + '!' : 'Привет! Я Светлячок! Давай познакомимся?';
        
        // Запускаем звук приветствия (если есть)
        var audioSrc = null;
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            audioSrc = GameConfig.getAudio('nameGreeting');
        }
        
        // Запускаем звук параллельно с текстом
        if (audioSrc) {
            var audio = new Audio(audioSrc);
            audio.volume = 1.0;
            audio.play().catch(function() {
                console.log('Autoplay blocked for greeting');
            });
        }
        
        // Запускаем печать текста
        UI.typeText(greetingText, helloText, 60, function() {
            // После окончания текста показываем кубики
            showBottom();
        });
        
        // Если звук долго не грузится — всё равно показываем кубики через 2.5 секунды
        var showTimeout = setTimeout(function() {
            showBottom();
        }, 2500);
        
        function showBottom() {
            clearTimeout(showTimeout);
            top.style.transform = 'translateY(-10px)';
            top.style.transition = 'all 0.5s ease';
            bottom.style.opacity = '1';
            bottom.style.transform = 'translateY(0)';
        }
    }
    
    return { render: render };
})();
