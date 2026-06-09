// ========== GAME1.JS ==========

const Game1 = (function() {
    'use strict';
    
    function renderIntro() {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        
        Progress.update(8);
        UI.clearContainer(c);
        
        var childName = GameState.getChildName() || 'друг';
        var parts = [
            childName + ', посмотри внимательно на то, что происходит у ребят в песочнице! ',
            'Здесь все чем-то заняты... Но каждый недоволен, ведь ему чего-то не хватает. Давай подумаем вместе: кому что нужно, чтобы всё получилось?'
        ];
        
        c.innerHTML = 
            '<div class="game-scene">' +
                '<div class="firefly-widget">' +
                    '<div class="firefly-avatar-lg" id="fireflyAvatar"></div>' +
                    '<div class="firefly-speech-bubble" id="fireflySpeech"></div>' +
                '</div>' +
                '<div class="overview-video-container" id="videoContainer" style="display:none;">' +
                    '<video id="overviewVideo" preload="auto" playsinline muted>' +
                        '<source src="' + GameConfig.getVideo('sandboxOverview') + '" type="video/mp4">' +
                    '</video>' +
                    '<div class="play-overlay" id="playOverlay"></div>' +
                '</div>' +
            '</div>';
        
        document.getElementById('fireflyAvatar').appendChild(
            UI.createClickableFirefly(55, 'game1Intro')
        );
        
        AudioManager.playVoice('game1Intro');
        
        var videoContainer = document.getElementById('videoContainer');
        var overviewVideo = document.getElementById('overviewVideo');
        var playOverlay = document.getElementById('playOverlay');
        
        UI.typeTextParts(document.getElementById('fireflySpeech'), parts, 56, function() {
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
                var showTime = overviewVideo.duration - 2;
                if (showTime < 0) showTime = 0;
                
                overviewVideo.addEventListener('timeupdate', function handler() {
                    if (overviewVideo.currentTime >= showTime) {
                        overviewVideo.removeEventListener('timeupdate', handler);
                        showPlayButton();
                    }
                });
            });
            
            // Фолбек: если видео не грузится — показать кнопку через 3 секунды
            setTimeout(function() {
                if (!playOverlay.querySelector('.play-btn-wrapper')) {
                    showPlayButton();
                }
            }, 3000);
        });
    }
    
    function openGame() {
        GameState.recordGamePlayed();
        
        Popup.openGamePopup({
            title: 'Помоги друзьям в песочнице! Соедини каждого персонажа с тем, что ему нужно.',
            audioKey: 'game1Popup',
            totalPairs: 5,
            characters: [
                { id: 'medvezhonok', img: 'medvezhonok' },
                { id: 'zaychonok', img: 'zaychonok' },
                { id: 'tonya', img: 'tonya' },
                { id: 'sonya', img: 'sonya' },
                { id: 'kolobok', img: 'kolobok' }
            ],
            items: [
                { id: 'vederko', img: 'cardWater' },
                { id: 'mesto', img: 'cardSpace' },
                { id: 'plan', img: 'cardPlan' },
                { id: 'decor', img: 'cardDecor' },
                { id: 'pomosh', img: 'cardHelp' }
            ],
            matches: {
                medvezhonok: 'vederko',
                zaychonok: 'mesto',
                tonya: 'plan',
                sonya: 'decor',
                kolobok: 'pomosh'
            },
            onComplete: function() {
                GameState.addStar();
                Navigation.goTo(VideoScene.renderStarReward1, 10);
            }
        });
    }
    
    return {
        renderIntro: renderIntro,
        openGame: openGame
    };
})();