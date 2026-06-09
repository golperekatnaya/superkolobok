// ========== COMPONENTS.JS ==========

const UI = (function() {
    'use strict';
    
    function createSceneButton(imageKey, className, onClick) {
        var button = document.createElement('button');
        button.className = 'scene-btn';
        if (className) button.className += ' ' + className;
        
        var img = document.createElement('img');
        img.src = getImagePath(imageKey);
        img.alt = '';
        img.loading = 'lazy';
        
        img.onerror = function() {
            img.style.display = 'none';
            button.textContent = '\u2192';
            button.style.fontSize = '24px';
            button.style.color = '#F5B342';
        };
        
        button.appendChild(img);
        if (typeof onClick === 'function') button.addEventListener('click', onClick);
        return button;
    }
    
    function createClickableFirefly(size, audioKey) {
        var container = document.createElement('div');
        container.className = 'firefly-clickable';
        container.style.width = size + 'px';
        container.style.height = size + 'px';
        container.style.overflow = 'visible';
        container.style.borderRadius = '0';
        container.style.background = 'transparent';
        container.style.border = 'none';
        container.style.boxShadow = 'none';
        
        var img = document.createElement('img');
        img.src = getImagePath('firefly');
        img.alt = '';
        img.loading = 'lazy';
        img.style.border = 'none';
        img.style.background = 'transparent';
        container.appendChild(img);
        
        if (audioKey) {
            container.title = 'Нажми, чтобы послушать';
            container.addEventListener('click', function(e) {
                e.stopPropagation();
                AudioManager.playVoice(audioKey);
            });
        }
        return container;
    }
    
    function createHintArrowButton(onClick) {
        var button = document.createElement('button');
        button.className = 'hint-arrow-btn';
        if (typeof onClick === 'function') button.addEventListener('click', onClick);
        return button;
    }
    
    function createPlayButton(onClick) {
        var wrapper = document.createElement('div');
        wrapper.className = 'play-btn-wrapper';
        wrapper.style.opacity = '0';
        wrapper.style.transform = 'scale(0.5)';
        wrapper.style.transition = 'all 0.5s ease';
        wrapper.style.pointerEvents = 'none';
        
        var button = document.createElement('button');
        button.className = 'play-btn';
        
        var img = document.createElement('img');
        img.src = getImagePath('playBtn');
        img.alt = 'Играть';
        button.appendChild(img);
        wrapper.appendChild(button);
        
        setTimeout(function() {
            wrapper.style.opacity = '1';
            wrapper.style.transform = 'scale(1)';
            wrapper.style.pointerEvents = 'auto';
        }, 100);
        
        if (typeof onClick === 'function') button.addEventListener('click', onClick);
        return wrapper;
    }
    
    function createFireflySpeechBubble(options) {
        var opts = options || {};
        var sizeMap = { 'sm': { avatar: 50 }, 'md': { avatar: 70 }, 'lg': { avatar: 90 } };
        var size = sizeMap[opts.fireflySize || 'md'];
        
        var container = document.createElement('div');
        container.className = 'firefly-widget';
        
        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'firefly-avatar-lg';
        avatarDiv.style.width = size.avatar + 'px';
        avatarDiv.style.height = size.avatar + 'px';
        avatarDiv.style.flexShrink = '0';
        avatarDiv.style.border = 'none';
        avatarDiv.style.background = 'transparent';
        avatarDiv.style.overflow = 'visible';
        
        var firefly = createClickableFirefly(size.avatar, opts.audioKey);
        avatarDiv.appendChild(firefly);
        
        var bubble = document.createElement('div');
        bubble.className = 'firefly-speech-bubble';
        
        container.appendChild(avatarDiv);
        container.appendChild(bubble);
        
        if (opts.text && opts.typeSpeed) typeText(bubble, opts.text, opts.typeSpeed, opts.onComplete);
        else if (opts.text) bubble.textContent = opts.text;
        
        return { container: container, bubble: bubble, firefly: firefly };
    }
    
    function createCharCard(charData, isMatched, onClick) {
        var card = document.createElement('div');
        card.className = 'char-card';
        card.dataset.charId = charData.id;
        if (isMatched) card.classList.add('matched-char');
        
        var imgContainer = document.createElement('div');
        imgContainer.className = 'char-card-img';
        
        var img = document.createElement('img');
        img.src = getImagePath(charData.img);
        img.alt = charData.id;
        img.loading = 'lazy';
        
        img.onerror = function() {
            img.style.display = 'none';
            imgContainer.textContent = charData.id.charAt(0).toUpperCase();
            imgContainer.style.cssText = 'display:flex;align-items:center;justify-content:center;font-weight:700;color:#C68B3C;';
        };
        
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        
        if (typeof onClick === 'function' && !isMatched) {
            card.addEventListener('click', function() {
                if (!card.classList.contains('matched-char')) onClick(card);
            });
        }
        return card;
    }
    
    function createItemCard(itemData, isMatched, onClick) {
        var card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.itemId = itemData.id;
        if (isMatched) card.classList.add('matched');
        
        var imgContainer = document.createElement('div');
        imgContainer.className = 'item-card-img';
        
        var img = document.createElement('img');
        img.src = getImagePath(itemData.img);
        img.alt = itemData.id;
        img.loading = 'lazy';
        
        img.onerror = function() {
            img.style.display = 'none';
            imgContainer.textContent = '?';
            imgContainer.style.cssText = 'display:flex;align-items:center;justify-content:center;font-weight:700;color:#5A7A40;';
        };
        
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);
        
        if (typeof onClick === 'function' && !isMatched) {
            card.addEventListener('click', function() {
                if (!card.classList.contains('matched')) onClick(card);
            });
        }
        return card;
    }
    
    function showVisualFeedback(container, isCorrect) {
        var existing = container.querySelector('.visual-feedback');
        if (existing) existing.remove();
        
        var feedback = document.createElement('div');
        feedback.className = 'visual-feedback ' + (isCorrect ? 'correct' : 'wrong');
        feedback.innerHTML = '<span class="visual-feedback-icon">' + (isCorrect ? '\u2713' : '\u2717') + '</span>';
        container.appendChild(feedback);
        
        // Принудительно играем звук через новый Audio (надёжнее чем AudioManager)
        var soundKey;
        if (isCorrect) {
            var correctSounds = ['correct1', 'correct2', 'correct3'];
            soundKey = correctSounds[Math.floor(Math.random() * correctSounds.length)];
        } else {
            var wrongSounds = ['wrong1', 'wrong2', 'wrong3'];
            soundKey = wrongSounds[Math.floor(Math.random() * wrongSounds.length)];
        }
        
        var soundSrc = null;
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            soundSrc = GameConfig.getSfx(soundKey);
        }
        
        if (soundSrc) {
            var audio = new Audio(soundSrc);
            audio.volume = 1.0;
            audio.play().catch(function(e) {
                console.warn('SFX error:', soundKey, e.message);
            });
        }
        
        setTimeout(function() { feedback.remove(); }, 800);
    }
    
    function showWinEffect(container) {
        var feedback = document.createElement('div');
        feedback.className = 'visual-feedback correct';
        feedback.style.width = '100px';
        feedback.style.height = '100px';
        feedback.innerHTML = '<span class="visual-feedback-icon" style="font-size:50px;">\u2605</span>';
        container.appendChild(feedback);
        setTimeout(function() { feedback.remove(); }, 1500);
    }
    
    function createGameProgress(total) {
        var container = document.createElement('div');
        container.className = 'game-progress';
        
        var fill = document.createElement('div');
        fill.className = 'game-progress-fill';
        
        var star = document.createElement('div');
        star.className = 'game-progress-star';
        star.textContent = '\u2605';
        star.style.opacity = '0.3';
        
        container.appendChild(fill);
        container.appendChild(star);
        
        function update(done) {
            var pct = (done / total) * 100;
            fill.style.width = pct + '%';
            var barWidth = container.offsetWidth - 16;
            var left = (pct / 100) * barWidth;
            left = Math.max(0, Math.min(left, barWidth));
            star.style.left = left + 'px';
            star.style.opacity = pct > 0 ? '1' : '0.3';
        }
        
        return { container: container, fill: fill, star: star, update: update };
    }
    
    function typeText(element, text, speed, callback) {
        if (!element || !text) { if (callback) callback(); return; }
        var index = 0;
        element.textContent = '';
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                if (callback) callback();
            }
        }
        type();
    }
    
    function typeTextParts(element, parts, speed, callback) {
        if (!element || !parts || parts.length === 0) { if (callback) callback(); return; }
        var partIndex = 0;
        function typePart() {
            if (partIndex >= parts.length) { if (callback) callback(); return; }
            var text = parts[partIndex];
            var charIndex = 0;
            function typeChar() {
                if (charIndex < text.length) {
                    element.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, speed);
                } else {
                    partIndex++;
                    setTimeout(typePart, 500);
                }
            }
            typeChar();
        }
        element.textContent = '';
        typePart();
    }
    
    function typeTextWithPauses(element, segments, speed, callback) {
        typeTextParts(element, segments, speed, callback);
    }
    
    function getImagePath(key) {
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            var path = GameConfig.getImage(key);
            if (path) return path;
        }
        return 'media/images/' + key + '.svg';
    }
    
    function clearContainer(container) {
        if (!container) return;
        var videos = container.querySelectorAll('video');
        videos.forEach(function(v) { v.pause(); v.src = ''; });
        container.innerHTML = '';
    }
    
    return {
        createSceneButton: createSceneButton,
        createClickableFirefly: createClickableFirefly,
        createHintArrowButton: createHintArrowButton,
        createPlayButton: createPlayButton,
        createFireflySpeechBubble: createFireflySpeechBubble,
        createCharCard: createCharCard,
        createItemCard: createItemCard,
        showVisualFeedback: showVisualFeedback,
        showWinEffect: showWinEffect,
        createGameProgress: createGameProgress,
        typeText: typeText,
        typeTextParts: typeTextParts,
        typeTextWithPauses: typeTextWithPauses,
        getImagePath: getImagePath,
        clearContainer: clearContainer
    };
})();