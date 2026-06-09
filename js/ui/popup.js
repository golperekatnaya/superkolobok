// ========== POPUP.JS ==========
// Управление всплывающими окнами: игры, тесты, подтверждения

const Popup = (function() {
    'use strict';
    
    var _activePopups = [];
    var _isInitialized = false;
    
    function init() {
        if (_isInitialized) return;
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && _activePopups.length > 0) {
                var topPopup = _activePopups[_activePopups.length - 1];
                if (topPopup && topPopup.closeOnEscape !== false) {
                    closeTopPopup();
                }
            }
        });
        
        _isInitialized = true;
    }
    
    function openGamePopup(config) {
        if (!_isInitialized) init();
        
        var opts = config || {};
        var totalPairs = opts.totalPairs || 5;
        var matches = opts.matches || {};
        
        var shuffledItems = (opts.items || []).slice().sort(function() {
            return Math.random() - 0.5;
        });
        
        var gameState = {
            selectedChar: null,
            selectedItem: null,
            matchedCount: 0,
            isComplete: false
        };
        
        var overlay = createOverlay();
        var popup = document.createElement('div');
        popup.className = 'game-popup';
        popup.id = 'gamePopupInner';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-label', 'Игровое задание');
        
        var closeBtn = document.createElement('button');
        closeBtn.className = 'popup-close-btn';
        closeBtn.textContent = '\u2715';
        closeBtn.setAttribute('aria-label', 'Закрыть игру');
        closeBtn.addEventListener('click', function() {
            closePopup(overlay);
        });
        
        var fireflyAvatar = document.createElement('div');
        fireflyAvatar.className = 'popup-firefly-avatar';
        fireflyAvatar.appendChild(UI.createClickableFirefly(70, opts.audioKey));
        
        var fireflySpeech = document.createElement('div');
        fireflySpeech.className = 'popup-firefly-speech';
        
        var fireflyRow = document.createElement('div');
        fireflyRow.className = 'popup-firefly-row';
        fireflyRow.appendChild(fireflyAvatar);
        fireflyRow.appendChild(fireflySpeech);
        
        var gameProgress = UI.createGameProgress(totalPairs);
        
        var board = document.createElement('div');
        board.className = 'game-board-horizontal';
        
        var charsSection = document.createElement('div');
        charsSection.className = 'game-section';
        charsSection.innerHTML = '<div class="game-section-label">Персонажи</div>';
        
        var charsRow = document.createElement('div');
        charsRow.className = 'game-row';
        
        (opts.characters || []).forEach(function(charData) {
            var card = UI.createCharCard(charData, false, function(card) {
                if (card.classList.contains('matched-char')) return;
                if (gameState.selectedChar) gameState.selectedChar.classList.remove('selected');
                card.classList.add('selected');
                gameState.selectedChar = card;
                tryMatch();
            });
            charsRow.appendChild(card);
        });
        charsSection.appendChild(charsRow);
        
        var itemsSection = document.createElement('div');
        itemsSection.className = 'game-section';
        itemsSection.innerHTML = '<div class="game-section-label">Что им нужно?</div>';
        
        var itemsRow = document.createElement('div');
        itemsRow.className = 'game-row';
        
        shuffledItems.forEach(function(itemData) {
            var card = UI.createItemCard(itemData, false, function(card) {
                if (card.classList.contains('matched')) return;
                if (gameState.selectedItem) gameState.selectedItem.classList.remove('selected');
                card.classList.add('selected');
                gameState.selectedItem = card;
                tryMatch();
            });
            itemsRow.appendChild(card);
        });
        itemsSection.appendChild(itemsRow);
        
        board.appendChild(charsSection);
        board.appendChild(itemsSection);
        
        popup.appendChild(closeBtn);
        popup.appendChild(fireflyRow);
        popup.appendChild(gameProgress.container);
        popup.appendChild(board);
        overlay.appendChild(popup);
        
        document.body.appendChild(overlay);
        
        var popupData = { overlay: overlay, popup: popup, closeOnEscape: opts.closeOnEscape !== false, onClose: opts.onClose };
        _activePopups.push(popupData);
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closePopup(overlay);
        });
        
        requestAnimationFrame(function() {
            overlay.style.opacity = '1';
            popup.style.transform = 'scale(1)';
        });
        
        if (opts.title) {
            UI.typeText(fireflySpeech, opts.title, 50);
        }
        
        if (opts.audioKey) {
            AudioManager.playVoice(opts.audioKey);
        }
        
        function tryMatch() {
            if (!gameState.selectedChar || !gameState.selectedItem) return;
            
            var charId = gameState.selectedChar.dataset.charId;
            var itemId = gameState.selectedItem.dataset.itemId;
            
            if (matches[charId] === itemId) {
                UI.showVisualFeedback(popup, true);
                
                gameState.selectedItem.classList.add('matched');
                gameState.selectedItem.classList.remove('selected');
                gameState.selectedItem.style.pointerEvents = 'none';
                
                gameState.selectedChar.classList.add('matched-char');
                gameState.selectedChar.classList.remove('selected');
                gameState.selectedChar.style.pointerEvents = 'none';
                
                gameState.matchedCount++;
                gameProgress.update(gameState.matchedCount);
                
                if (typeof GameState !== 'undefined') GameState.recordMatch(true);
                if (typeof opts.onMatch === 'function') opts.onMatch(charId, itemId);
                
                gameState.selectedChar = null;
                gameState.selectedItem = null;
                
                if (gameState.matchedCount >= totalPairs && !gameState.isComplete) {
                    gameState.isComplete = true;
                    UI.showWinEffect(popup);
                    
                    setTimeout(function() {
                        closePopup(overlay);
                        if (typeof opts.onComplete === 'function') opts.onComplete();
                    }, 1200);
                }
            } else {
                UI.showVisualFeedback(popup, false);
                
                if (typeof GameState !== 'undefined') GameState.recordMatch(false);
                if (typeof opts.onMismatch === 'function') opts.onMismatch(charId, itemId);
                
                var selChar = gameState.selectedChar;
                var selItem = gameState.selectedItem;
                
                setTimeout(function() {
                    if (selChar) selChar.classList.remove('selected');
                    if (selItem) selItem.classList.remove('selected');
                }, 300);
                
                gameState.selectedChar = null;
                gameState.selectedItem = null;
            }
        }
        
        return {
            overlay: overlay,
            popup: popup,
            close: function() { closePopup(overlay); },
            getMatchedCount: function() { return gameState.matchedCount; }
        };
    }
    
    function openTestPopup(config) {
        if (!_isInitialized) init();
        
        var opts = config || {};
        var isAnswered = false;
        
        var overlay = createOverlay();
        var popup = document.createElement('div');
        popup.className = 'test-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-label', 'Вопрос');
        
        var fireflyRow = document.createElement('div');
        fireflyRow.className = 'test-firefly-row';
        
        var fireflyAvatar = document.createElement('div');
        fireflyAvatar.className = 'test-firefly-avatar';
        fireflyAvatar.appendChild(UI.createClickableFirefly(70, opts.questionAudio));
        
        var questionBubble = document.createElement('div');
        questionBubble.className = 'test-question-bubble';
        
        fireflyRow.appendChild(fireflyAvatar);
        fireflyRow.appendChild(questionBubble);
        
        var optionsContainer = document.createElement('div');
        optionsContainer.className = 'test-options';
        
        var optionElements = [];
        
        (opts.options || []).forEach(function(optData) {
            var option = document.createElement('div');
            option.className = 'test-option';
            option.dataset.answer = optData.id;
            
            var reaction = document.createElement('div');
            reaction.className = 'test-reaction';
            reaction.id = 'reaction-' + optData.id;
            
            if (optData.reactionImg) {
                var reactionImg = document.createElement('img');
                reactionImg.src = UI.getImagePath(optData.reactionImg);
                reactionImg.alt = '';
                reaction.appendChild(reactionImg);
            }
            
            var optionText = document.createElement('span');
            optionText.className = 'test-option-text';
            
            var audioBtn = document.createElement('button');
            audioBtn.className = 'test-option-audio-btn';
            audioBtn.textContent = '\u266A';
            audioBtn.title = 'Прослушать';
            audioBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                AudioManager.playVoice(optData.audio);
            });
            
            option.appendChild(reaction);
            option.appendChild(optionText);
            option.appendChild(audioBtn);
            
            option.style.pointerEvents = 'none';
            optionsContainer.appendChild(option);
            
            optionElements.push({ element: option, reaction: reaction, text: optionText, data: optData });
        });
        
        popup.appendChild(fireflyRow);
        popup.appendChild(optionsContainer);
        overlay.appendChild(popup);
        
        document.body.appendChild(overlay);
        
        var popupData = { overlay: overlay, popup: popup, closeOnEscape: false, onClose: opts.onClose };
        _activePopups.push(popupData);
        
        requestAnimationFrame(function() { overlay.style.opacity = '1'; });
        
        UI.typeText(questionBubble, opts.questionText || '', 50, function() {
            showOptionsSequentially(0);
        });
        
        if (opts.questionAudio) AudioManager.playVoice(opts.questionAudio);
        
        function showOptionsSequentially(index) {
            if (index >= optionElements.length) {
                optionElements.forEach(function(item) {
                    item.element.style.pointerEvents = 'auto';
                    item.element.addEventListener('click', function() { handleOptionClick(item); });
                });
                return;
            }
            
            var item = optionElements[index];
            setTimeout(function() {
                item.element.classList.add('show-option');
                UI.typeText(item.text, item.data.text, 40);
                if (item.data.audio) AudioManager.playVoice(item.data.audio);
                showOptionsSequentially(index + 1);
            }, 400);
        }
        
        function handleOptionClick(item) {
            if (isAnswered) return;
            
            if (item.data.isCorrect) {
                isAnswered = true;
                item.element.classList.add('correct');
                
                optionElements.forEach(function(opt) { opt.element.style.pointerEvents = 'none'; });
                
                AudioManager.playRandomCorrect();
                if (typeof opts.onCorrect === 'function') opts.onCorrect(item.data);
                
                setTimeout(function() {
                    closePopup(overlay);
                    if (typeof opts.onComplete === 'function') opts.onComplete();
                }, 1000);
            } else {
                item.element.classList.add('wrong');
                item.reaction.classList.add('show');
                
                AudioManager.playRandomWrong();
                if (typeof opts.onWrong === 'function') opts.onWrong(item.data);
                
                setTimeout(function() {
                    item.element.classList.remove('wrong');
                    item.reaction.classList.remove('show');
                }, 1500);
            }
        }
        
        return { overlay: overlay, popup: popup, close: function() { closePopup(overlay); } };
    }
    
    function openConfirmPopup(config) {
        if (!_isInitialized) init();
        
        var opts = config || {};
        
        var overlay = createOverlay();
        var popup = document.createElement('div');
        popup.className = 'game-popup';
        popup.style.cssText = 'text-align:center;max-width:400px;padding:24px;';
        popup.setAttribute('role', 'alertdialog');
        
        popup.innerHTML = 
            '<h3 style="color:#C68B3C;margin-bottom:12px;font-size:1rem;">' + (opts.title || 'Подтверждение') + '</h3>' +
            '<p style="color:#4A3724;margin-bottom:20px;font-size:0.85rem;line-height:1.4;">' + (opts.message || 'Вы уверены?') + '</p>' +
            '<div style="display:flex;gap:10px;justify-content:center;">' +
                '<button id="popupConfirmBtn" style="background:#F5B342;color:white;border:none;padding:10px 24px;border-radius:50px;font-weight:700;cursor:pointer;">' + (opts.confirmText || 'Да') + '</button>' +
                '<button id="popupCancelBtn" style="background:#FFF0E0;color:#C88060;border:2px solid #E0C0A0;padding:10px 24px;border-radius:50px;font-weight:700;cursor:pointer;">' + (opts.cancelText || 'Нет') + '</button>' +
            '</div>';
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        _activePopups.push({ overlay: overlay, popup: popup, closeOnEscape: true });
        
        requestAnimationFrame(function() { overlay.style.opacity = '1'; });
        
        popup.querySelector('#popupConfirmBtn').addEventListener('click', function() {
            closePopup(overlay);
            if (typeof opts.onConfirm === 'function') opts.onConfirm();
        });
        
        popup.querySelector('#popupCancelBtn').addEventListener('click', function() {
            closePopup(overlay);
            if (typeof opts.onCancel === 'function') opts.onCancel();
        });
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closePopup(overlay);
                if (typeof opts.onCancel === 'function') opts.onCancel();
            }
        });
        
        return { overlay: overlay, popup: popup, close: function() { closePopup(overlay); } };
    }
    
    function showToast(message, type, duration) {
        var toast = document.createElement('div');
        var colors = {
            success: { bg: '#8CB86B', text: 'white' },
            error: { bg: '#E08060', text: 'white' },
            info: { bg: '#F5B342', text: 'white' }
        };
        var color = colors[type] || colors.info;
        
        toast.style.cssText = 
            'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:10000;' +
            'background:' + color.bg + ';color:' + color.text + ';' +
            'padding:12px 24px;border-radius:50px;font-size:0.85rem;font-weight:600;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.2);pointer-events:none;' +
            'animation: fadeSlideIn 0.3s ease;';
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function() { toast.remove(); }, 300);
        }, duration || 2000);
    }
    
    function createOverlay() {
        var overlay = document.createElement('div');
        overlay.className = 'game-popup-overlay';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.setAttribute('aria-modal', 'true');
        return overlay;
    }
    
    function closePopup(overlay) {
        if (!overlay) return;
        overlay.style.opacity = '0';
        
        var popup = overlay.querySelector('.game-popup, .test-popup');
        if (popup) {
            popup.style.transform = 'scale(0.8)';
            popup.style.transition = 'transform 0.3s ease';
        }
        
        setTimeout(function() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            _activePopups = _activePopups.filter(function(p) { return p.overlay !== overlay; });
        }, 300);
    }
    
    function closeTopPopup() {
        if (_activePopups.length === 0) return;
        closePopup(_activePopups[_activePopups.length - 1].overlay);
    }
    
    function closeAllPopups() {
        var popups = _activePopups.slice();
        popups.forEach(function(p) { closePopup(p.overlay); });
        _activePopups = [];
    }
    
    return {
        init: init,
        openGamePopup: openGamePopup,
        openTestPopup: openTestPopup,
        openConfirmPopup: openConfirmPopup,
        showToast: showToast,
        closeAllPopups: closeAllPopups,
        closeTopPopup: closeTopPopup,
        getActiveCount: function() { return _activePopups.length; },
        hasActivePopups: function() { return _activePopups.length > 0; }
    };
})();