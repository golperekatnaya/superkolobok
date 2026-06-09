// ========== TEST.JS ==========

const Test = (function() {
    'use strict';
    
    function render() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.update(11);
        UI.clearContainer(c);
        
        c.innerHTML = 
            '<div class="video-scene" style="position:relative;">' +
                '<video id="testVideo" preload="auto" playsinline style="width:100%;display:block;">' +
                    '<source src="' + GameConfig.getVideo('somethingWrong') + '" type="video/mp4">' +
                '</video>' +
            '</div>';
        
        var video = document.getElementById('testVideo');
        var testShown = false;
        
        // Клик для Play/Pause
        video.addEventListener('click', function() {
            if (video.paused) { video.play().catch(function(){}); }
            else { video.pause(); }
        });
        
        video.addEventListener('timeupdate', function() {
            if (video.currentTime >= 26 && !testShown) {
                testShown = true;
                video.pause();
                showTestPopup(video);
            }
        });
        
        video.play().catch(function() {});
    }
    
    function showTestPopup(video) {
        var existing = document.getElementById('testPopupOverlay');
        if (existing) existing.remove();
        
        var overlay = document.createElement('div');
        overlay.className = 'game-popup-overlay';
        overlay.id = 'testPopupOverlay';
        
        var html = 
            '<div class="test-popup">' +
                '<div class="test-firefly-row">' +
                    '<div class="test-firefly-avatar" id="testFireflyAvatar"></div>' +
                    '<div class="test-question-bubble" id="testQuestionBubble"></div>' +
                '</div>' +
                '<div class="test-options" id="testOptionsContainer"></div>' +
            '</div>';
        
        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        
        document.getElementById('testFireflyAvatar').appendChild(
            UI.createClickableFirefly(70, 'testQuestion')
        );
        
        var questionText = 'Как Колобку лучше ответить Зайчонку, чтобы они не поссорились?';
        var optionsData = [
            { id: 'wrong1', text: '— Потому что вы сами ничего нормально не делаете!', reaction: 'reaction1', img: 'angryZaychonok', audio: 'testOption1' },
            { id: 'correct', text: '— Я не командую. Я просто вижу, что у нас не получается, и мне от этого грустно.', reaction: null, img: null, audio: 'testOption2' },
            { id: 'wrong3', text: '— Ну и делайте тогда как хотите, я вообще молчу.', reaction: 'reaction3', img: 'sadKolobok', audio: 'testOption3' }
        ];
        
        var answered = false;
        var questionBubble = document.getElementById('testQuestionBubble');
        var optionsContainer = document.getElementById('testOptionsContainer');
        
        UI.typeText(questionBubble, questionText, 50);
        AudioManager.playVoice('testQuestion', function() {
            showOptionsSequentially(0);
        });
        
        function showOptionsSequentially(index) {
            if (index >= optionsData.length) {
                var allOpts = optionsContainer.querySelectorAll('.test-option');
                allOpts.forEach(function(optEl) {
                    optEl.style.pointerEvents = 'auto';
                });
                return;
            }
            
            var optData = optionsData[index];
            var optEl = document.createElement('div');
            optEl.className = 'test-option';
            optEl.dataset.answer = optData.id;
            optEl.style.pointerEvents = 'none';
            
            if (optData.reaction) {
                var reactionDiv = document.createElement('div');
                reactionDiv.className = 'test-reaction';
                reactionDiv.id = optData.reaction;
                var rImg = document.createElement('img');
                rImg.src = UI.getImagePath(optData.img);
                rImg.alt = '';
                reactionDiv.appendChild(rImg);
                optEl.appendChild(reactionDiv);
            }
            
            var textSpan = document.createElement('span');
            textSpan.className = 'test-option-text';
            optEl.appendChild(textSpan);
            
            var audioBtn = document.createElement('button');
            audioBtn.className = 'test-option-audio-btn';
            audioBtn.textContent = '\u266A';
            audioBtn.title = 'Прослушать';
            audioBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                AudioManager.playVoice(optData.audio);
            });
            optEl.appendChild(audioBtn);
            
            optEl.addEventListener('click', function() {
                if (answered) return;
                
                if (optData.id === 'correct') {
                    answered = true;
                    optEl.classList.add('correct');
                    AudioManager.playRandomCorrect();
                    
                    setTimeout(function() {
                        overlay.remove();
                        // Добавляем клик для видео после возврата
                        video.addEventListener('click', function() {
                            if (video.paused) { video.play().catch(function(){}); }
                            else { video.pause(); }
                        });
                        video.play();
                        video.addEventListener('ended', function handler() {
                            video.removeEventListener('ended', handler);
                            Navigation.goTo(HintScreen.render2, 12);
                        });
                    }, 800);
                } else {
                    optEl.classList.add('wrong');
                    if (optData.reaction) {
                        var r = document.getElementById(optData.reaction);
                        if (r) r.classList.add('show');
                    }
                    AudioManager.playRandomWrong();
                    
                    setTimeout(function() {
                        optEl.classList.remove('wrong');
                        if (optData.reaction) {
                            var r2 = document.getElementById(optData.reaction);
                            if (r2) r2.classList.remove('show');
                        }
                    }, 1500);
                }
            });
            
            optionsContainer.appendChild(optEl);
            
            setTimeout(function() {
                optEl.classList.add('show-option');
                UI.typeText(textSpan, optData.text, 40);
                AudioManager.playVoice(optData.audio, function() {
                    setTimeout(function() {
                        showOptionsSequentially(index + 1);
                    }, 300);
                });
            }, 200);
        }
    }
    
    return { render: render };
})();