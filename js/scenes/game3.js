// ========== GAME3.JS ==========

const Game3 = (function() {
    'use strict';
    
    function renderIntro() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.update(18);
        UI.clearContainer(c);
        
        var childName = GameState.getChildName() || 'друг';
        
        c.innerHTML = 
            '<div class="game-scene">' +
                '<div class="firefly-widget">' +
                    '<div class="firefly-avatar-lg" id="fireflyAvatar"></div>' +
                    '<div class="firefly-speech-bubble" id="fireflySpeech"></div>' +
                '</div>' +
                '<div class="overview-video-container" id="videoContainer" style="display:none;">' +
                    '<video id="overviewVideo" preload="auto" playsinline>' +
                        '<source src="' + GameConfig.getVideo('dinnerFail') + '" type="video/mp4">' +
                    '</video>' +
                    '<div class="play-overlay" id="playOverlay"></div>' +
                '</div>' +
            '</div>';
        
        document.getElementById('fireflyAvatar').appendChild(
            UI.createClickableFirefly(70, 'fireflyDinnerSpeech')
        );
        
        var audioDone = false;
        var textDone = false;
        var videoContainer = document.getElementById('videoContainer');
        var overviewVideo = document.getElementById('overviewVideo');
        var playOverlay = document.getElementById('playOverlay');
        
        function tryShowVideo() {
            if (audioDone && textDone) {
                videoContainer.style.display = 'block';
                
                overviewVideo.play().catch(function() {
                    overviewVideo.controls = true;
                });
                
                function showPlayButton() {
                    var existingBtn = playOverlay.querySelector('.play-btn-wrapper');
                    if (existingBtn) return;
                    
                    var playBtn = UI.createPlayButton(function() {
                        overviewVideo.pause();
                        openGame();
                    });
                    playOverlay.appendChild(playBtn);
                    playOverlay.classList.add('visible');
                }
                
                overviewVideo.addEventListener('loadedmetadata', function() {
                    var showTime = overviewVideo.duration - 3;
                    if (showTime < 0) showTime = 0;
                    
                    overviewVideo.addEventListener('timeupdate', function handler() {
                        if (overviewVideo.currentTime >= showTime) {
                            overviewVideo.removeEventListener('timeupdate', handler);
                            showPlayButton();
                        }
                    });
                });
                
                setTimeout(function() {
                    if (!playOverlay.querySelector('.play-btn-wrapper')) {
                        showPlayButton();
                    }
                }, 3000);
            }
        }
        
        AudioManager.playVoice('fireflyDinnerSpeech', function() {
            audioDone = true;
            tryShowVideo();
        });
        
        UI.typeText(
            document.getElementById('fireflySpeech'),
            childName + ', посмотри, что происходит, когда ребята пытаются приготовить обед вместе... Кажется, у них что-то не получается — нужно помочь. А ты уже знаешь, что делать! Мы этому научились, когда строили песочный город. Напомнишь героям, как правильно работать вместе?',
            50,
            function() {
                textDone = true;
                tryShowVideo();
            }
        );
    }
    
    function openGame() {
        GameState.recordGamePlayed();
        
        Popup.openGamePopup({
            title: 'Помоги друзьям распределить, кто чем будет заниматься при приготовлении обеда!',
            audioKey: 'game3Popup',
            totalPairs: 5,
            characters: [
                { id: 'zaychonok', img: 'dinnerTalentZaychonok' },
                { id: 'sonya', img: 'dinnerTalentSonya' },
                { id: 'tonya', img: 'dinnerTalentTonya' },
                { id: 'medvezhonok', img: 'dinnerTalentMedvezhonok' },
                { id: 'kolobok', img: 'dinnerTalentKolobok' }
            ],
            items: [
                { id: 'cake', img: 'dinnerRoleCake' },
                { id: 'decorate', img: 'dinnerRoleDecorate' },
                { id: 'recipe', img: 'dinnerRoleRecipe' },
                { id: 'ingredients', img: 'dinnerRoleIngredients' },
                { id: 'help', img: 'dinnerRoleHelp' }
            ],
            matches: {
                zaychonok: 'cake',
                sonya: 'decorate',
                tonya: 'recipe',
                medvezhonok: 'ingredients',
                kolobok: 'help'
            },
            onComplete: function() {
                showDinnerSuccess();
            }
        });
    }
    
    function showDinnerSuccess() {
        Progress.update(19);
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        c.innerHTML = 
            '<div class="video-scene">' +
                '<video id="dsVideo" preload="auto" playsinline controls>' +
                    '<source src="' + GameConfig.getVideo('dinnerSuccess') + '" type="video/mp4">' +
                '</video>' +
            '</div>';
        var v = document.getElementById('dsVideo');
        v.addEventListener('ended', function() { showMamaBearPraise(); });
        v.play().catch(function() { v.controls = true; });
    }
    
    function showMamaBearPraise() {
        Progress.update(20);
        var c = document.getElementById('sceneContent');
        UI.clearContainer(c);
        c.innerHTML = 
            '<div class="video-scene">' +
                '<video id="mbpVideo" preload="auto" playsinline controls>' +
                    '<source src="' + GameConfig.getVideo('mamaBearPraise') + '" type="video/mp4">' +
                '</video>' +
            '</div>';
        var v = document.getElementById('mbpVideo');
        v.addEventListener('ended', function() {
            GameState.addStar();
            Navigation.goTo(VideoScene.renderStarReward3, 21);
        });
        v.play().catch(function() { v.controls = true; });
    }
    
    return {
        renderIntro: renderIntro,
        openGame: openGame
    };
})();