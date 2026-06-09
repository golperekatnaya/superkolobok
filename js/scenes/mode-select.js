// ========== MODE-SELECT.JS ==========
// Экран выбора режима (перед вводом имени)

const ModeSelect = (function() {
    'use strict';
    
    let selectedMode = null;
    
    function render() {
        const container = document.getElementById('sceneContent');
        if (!container) return;
        
        Progress.hide();
        
        container.innerHTML = `
            <div class="mode-select-screen" style="display:flex;">
                <div class="mode-container">
                    <div class="mode-header">
                        <div class="mode-firefly-container" id="modeFireflyContainer"></div>
                        <h2 class="mode-title">Как будем играть?</h2>
                        <p class="mode-subtitle">Выбери свой путь приключения</p>
                    </div>
                    
                    <div class="mode-cards">
                        <!-- РЕЖИМ "САМ" -->
                        <div class="mode-card" data-mode="solo" id="modeSoloCard">
                            <div class="mode-card-image">
                                <img src="media/images/mode-solo.png" alt="Играю сам" onerror="this.parentElement.innerHTML='<div style=font-size:40px;>🎓</div>'">
                            </div>
                            <div class="mode-card-content">
                                <h3>Я играю сам</h3>
                                <p>Я самостоятельно пройду все приключения, отвечу на вопросы и получу награды!</p>
                                <div class="mode-card-badge">Для самостоятельных исследователей</div>
                            </div>
                            <div class="mode-card-hover">
                                <span>Нажми, чтобы выбрать →</span>
                            </div>
                        </div>
                        
                        <!-- РЕЖИМ "С ВЗРОСЛЫМ" -->
                        <div class="mode-card" data-mode="adult" id="modeAdultCard">
                            <div class="mode-card-image">
                                <img src="media/images/mode-adult.png" alt="Играем вместе" onerror="this.parentElement.innerHTML='<div style=font-size:40px;>👨‍👧</div>'">
                            </div>
                            <div class="mode-card-content">
                                <h3>Играем вместе со взрослым</h3>
                                <p>Мама, папа или учитель помогут мне в сложных моментах, и мы обсудим всё вместе!</p>
                                <div class="mode-card-badge">Для совместной игры</div>
                            </div>
                            <div class="mode-card-hover">
                                <span>Нажми, чтобы выбрать →</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mode-footer">
                        <button class="mode-skip-btn" id="modeSkipBtn">Выберу позже</button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем светлячка (анимированный персонаж)
        const fireflyContainer = document.getElementById('modeFireflyContainer');
        if (fireflyContainer && typeof UI !== 'undefined' && UI.createClickableFirefly) {
            const firefly = UI.createClickableFirefly(80, 'modeGreeting');
            if (firefly) fireflyContainer.appendChild(firefly);
        } else if (fireflyContainer) {
            // Fallback, если UI нет
            fireflyContainer.innerHTML = '<img src="media/images/firefly.png" alt="Светлячок" style="width:80px;height:80px;">';
        }
        
        // Вешаем обработчики
        const soloCard = document.getElementById('modeSoloCard');
        const adultCard = document.getElementById('modeAdultCard');
        const skipBtn = document.getElementById('modeSkipBtn');
        
        if (soloCard) soloCard.addEventListener('click', () => selectMode('solo'));
        if (adultCard) adultCard.addEventListener('click', () => selectMode('adult'));
        if (skipBtn) skipBtn.addEventListener('click', () => skipMode());
        
        // Анимация появления карточек
        const cards = document.querySelectorAll('.mode-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
        
        // Воспроизводим приветствие (если есть звук)
        playWelcomeSound();
    }
    
    function selectMode(mode) {
        if (selectedMode) return;
        selectedMode = mode;
        
        // Визуальная обратная связь
        const card = document.getElementById(mode === 'solo' ? 'modeSoloCard' : 'modeAdultCard');
        if (card) {
            card.style.transform = 'scale(0.98)';
            card.style.backgroundColor = '#FFF8EC';
            card.style.borderColor = '#F5B342';
            
            // Добавляем галочку выбора
            const existingCheck = card.querySelector('.mode-check-mark');
            if (!existingCheck) {
                const checkMark = document.createElement('div');
                checkMark.className = 'mode-check-mark';
                checkMark.innerHTML = '✓';
                checkMark.style.position = 'absolute';
                checkMark.style.top = '10px';
                checkMark.style.right = '10px';
                checkMark.style.width = '28px';
                checkMark.style.height = '28px';
                checkMark.style.backgroundColor = '#8CB86B';
                checkMark.style.color = 'white';
                checkMark.style.borderRadius = '50%';
                checkMark.style.display = 'flex';
                checkMark.style.alignItems = 'center';
                checkMark.style.justifyContent = 'center';
                checkMark.style.fontSize = '18px';
                checkMark.style.fontWeight = 'bold';
                card.style.position = 'relative';
                card.appendChild(checkMark);
            }
        }
        
        // Сохраняем режим
        localStorage.setItem('gameMode', mode);
        if (typeof GameState !== 'undefined' && GameState.setGameMode) {
            GameState.setGameMode(mode);
        }
        
        // Звук выбора
        playSelectSound();
        
        // Переход к экрану имени
        setTimeout(() => {
            if (typeof NameScreen !== 'undefined') {
                NameScreen.render();
            }
        }, 400);
    }
    
    function skipMode() {
        // По умолчанию режим "со взрослым" (безопаснее для детей)
        localStorage.setItem('gameMode', 'adult');
        if (typeof GameState !== 'undefined' && GameState.setGameMode) {
            GameState.setGameMode('adult');
        }
        
        playClickSound();
        
        setTimeout(() => {
            if (typeof NameScreen !== 'undefined') {
                NameScreen.render();
            }
        }, 200);
    }
    
    function playWelcomeSound() {
        if (typeof AudioManager !== 'undefined') {
            // Пробуем воспроизвести приветствие
            const audio = new Audio('media/audio/mode-welcome.mp3');
            audio.volume = 0.7;
            audio.play().catch(() => {
                // Если файла нет — игнорируем
                console.log('[ModeSelect] Звук приветствия не найден');
            });
        }
    }
    
    function playSelectSound() {
        if (typeof AudioManager !== 'undefined') {
            const audio = new Audio('media/audio/mode-select.mp3');
            audio.volume = 0.8;
            audio.play().catch(() => {});
        }
    }
    
    function playClickSound() {
        if (typeof AudioManager !== 'undefined') {
            const audio = new Audio('media/audio/click.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => {});
        }
    }
    
    function shouldShow() {
        // Показываем экран выбора режима, если режим ещё не выбран
        const savedMode = localStorage.getItem('gameMode');
        return !savedMode;
    }
    
    return {
        render: render,
        shouldShow: shouldShow
    };
})();