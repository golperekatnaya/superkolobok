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
    
    function render() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.hide();
        UI.clearContainer(c);
        cacheLetterPaths();
        
        var letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
        var currentName = '';
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
        var greetingText = document.getElementById('nameGreetingText');
        
        // Изначально bottom скрыт
        bottom.style.opacity = '0';
        bottom.style.transform = 'translateY(30px)';
        bottom.style.transition = 'all 0.6s ease';
        
        letters.forEach(function(letter) {
            var cube = document.createElement('div');
            cube.className = 'cube';
            cube.textContent = letter;
            cube.addEventListener('click', function() {
                if (isConfirmed) return;
                playLetterSound(letter);
                if (currentName.length < 12) {
                    currentName += letter;
                    updateDisplay();
                }
            });
            grid.appendChild(cube);
        });
        
        function updateDisplay() {
            if (!currentName) {
                display.textContent = 'Твоё имя';
                display.classList.add('placeholder');
                btnConfirm.disabled = true;
            } else {
                display.textContent = currentName;
                display.classList.remove('placeholder');
                btnConfirm.disabled = false;
            }
        }
        
        btnClear.addEventListener('click', function() {
            if (isConfirmed) return;
            currentName = '';
            updateDisplay();
        });
        
        btnConfirm.addEventListener('click', function() {
            if (!currentName || isConfirmed) return;
            isConfirmed = true;
            GameState.setChildName(currentName);
            btnConfirm.disabled = true;
            btnClear.style.opacity = '0.5';
            btnClear.style.pointerEvents = 'none';
            grid.querySelectorAll('.cube').forEach(function(cu) {
                cu.style.opacity = '0.5';
                cu.style.pointerEvents = 'none';
            });
            setTimeout(function() { Navigation.goTo(SeriesSelect.render, 1); }, 300);
        });
        
        // Приветственный текст
        var name = GameState.getChildName() || '';
        var helloText = name ? 'С возвращением, ' + name + '!' : 'Привет! Я Светлячок! Давай познакомимся?';
        UI.typeText(greetingText, helloText, 60);
        
        // Показать кубики через 2.5 секунды (или после звука)
        function showBottom() {
            top.style.transform = 'translateY(-10px)';
            top.style.transition = 'all 0.5s ease';
            bottom.style.opacity = '1';
            bottom.style.transform = 'translateY(0)';
        }
        
        var audioSrc = null;
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            audioSrc = GameConfig.getAudio('nameGreeting');
        }
        
        if (audioSrc) {
            var audio = new Audio(audioSrc);
            audio.volume = 1.0;
            audio.onended = function() { setTimeout(showBottom, 300); };
            audio.onerror = function() { setTimeout(showBottom, 2500); };
            audio.play().catch(function() { setTimeout(showBottom, 2500); });
        } else {
            setTimeout(showBottom, 2500);
        }
    }
    
    return { render: render };
})();