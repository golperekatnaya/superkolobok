// ========== GAME2.JS ==========
// Игра 2: Таланты — кто что делает в городе?

const Game2 = (function() {
    'use strict';
    
    var SCENE_INDEX = 13;
    var NEXT_SCENE_INDEX = 15;
    
    function renderIntro() {
        var sceneContent = document.getElementById('sceneContent');
        if (!sceneContent) return;
        
        Progress.update(SCENE_INDEX);
        UI.clearContainer(sceneContent);
        
        sceneContent.innerHTML = 
            '<div class="game-scene">' +
                '<div class="firefly-widget">' +
                    '<div class="firefly-avatar-lg" id="fireflyAvatar"></div>' +
                    '<div class="firefly-speech-bubble" id="fireflySpeech"></div>' +
                '</div>' +
                '<div id="playBtnContainer" style="text-align:center;margin-top:16px;"></div>' +
            '</div>';
        
        document.getElementById('fireflyAvatar').appendChild(
            UI.createClickableFirefly(55, 'game2Intro')
        );
        
        AudioManager.playVoice('game2Intro');
        
        UI.typeTextWithPauses(
            document.getElementById('fireflySpeech'),
            [
                'Как понять, у кого что лучше получается?',
                ' Хороший вопрос!',
                ' Посмотри внимательно на каждого героя, его умения и интересы, и попробуй распределить: кто и что будет делать в песочном городе.'
            ],
            60,
            function() {
                var container = document.getElementById('playBtnContainer');
                var playBtn = UI.createPlayButton(function() {
                    openGame();
                });
                container.appendChild(playBtn);
            }
        );
    }
    
    function openGame() {
        GameState.recordGamePlayed();
        
        Popup.openGamePopup({
            title: 'Соедини каждого героя с его делом в городе.',
            audioKey: 'game2Popup',
            totalPairs: 5,
            characters: [
                { id: 'sonya', img: 'talentSonya' },
                { id: 'tonya', img: 'talentTonya' },
                { id: 'zaychonok', img: 'talentZaychonok' },
                { id: 'medvezhonok', img: 'talentMedvezhonok' },
                { id: 'kolobok', img: 'talentKolobok' }
            ],
            items: [
                { id: 'decor', img: 'roleDecor' },
                { id: 'plan', img: 'rolePlan' },
                { id: 'build', img: 'roleBuild' },
                { id: 'tools', img: 'roleTools' },
                { id: 'lead', img: 'roleLead' }
            ],
            matches: {
                sonya: 'decor',
                tonya: 'plan',
                zaychonok: 'build',
                medvezhonok: 'tools',
                kolobok: 'lead'
            },
            onComplete: function() {
                showResult();
            }
        });
    }
    
    function showResult() {
        var sceneContent = document.getElementById('sceneContent');
        if (!sceneContent) return;
        
        Progress.update(14);
        UI.clearContainer(sceneContent);
        
        sceneContent.innerHTML = 
            '<div class="game-scene">' +
                '<div class="firefly-widget">' +
                    '<div class="firefly-avatar-lg" id="fireflyAvatar"></div>' +
                    '<div class="firefly-speech-bubble" id="fireflySpeech"></div>' +
                '</div>' +
                '<div class="overview-video-container" id="videoContainer" style="display:none;"></div>' +
            '</div>';
        
        document.getElementById('fireflyAvatar').appendChild(
            UI.createClickableFirefly(55, 'game2Result')
        );
        
        var audioDone = false;
        var textDone = false;
        
        function tryShowVideo() {
            if (audioDone && textDone) {
                var container = document.getElementById('videoContainer');
                container.style.display = 'block';
                container.innerHTML = 
                    '<video id="togetherVideo" preload="auto" playsinline controls>' +
                        '<source src="' + GameConfig.getVideo('together') + '" type="video/mp4">' +
                    '</video>';
                
                var video = document.getElementById('togetherVideo');
                video.addEventListener('ended', function() {
                    GameState.addStar();
                    Navigation.goTo(VideoScene.renderStarReward2, NEXT_SCENE_INDEX);
                });
                video.play().catch(function() { video.controls = true; });
            }
        }
        
        AudioManager.playVoice('game2Result', function() {
            audioDone = true;
            tryShowVideo();
        });
        
        UI.typeText(
            document.getElementById('fireflySpeech'),
            'Отлично! Каждый занялся тем, что у него получается лучше. Теперь посмотрим, что вышло вместе.',
            70,
            function() {
                textDone = true;
                tryShowVideo();
            }
        );
    }
    
    return {
        renderIntro: renderIntro,
        openGame: openGame
    };
})();