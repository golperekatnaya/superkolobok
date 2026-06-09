// ========== HINT-SCREEN.JS ==========

const HintScreen = (function() {
    'use strict';
    
    function render(config) {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        Progress.update(config.sceneIndex);
        AudioManager.playSfx('fireflyAppear');
        UI.clearContainer(c);
        
        c.innerHTML = 
            '<div class="hint-screen">' +
                '<div class="hint-row" id="hintRow">' +
                    '<div style="width:50px;height:50px;flex-shrink:0;overflow:visible;border:none;background:transparent;border-radius:0;">' +
                        '<img src="' + UI.getImagePath('firefly') + '" alt="" style="width:50px;height:50px;object-fit:contain;border:none;background:transparent;display:block;">' +
                    '</div>' +
                    '<div class="hint-speech-bubble" id="hintBubble"></div>' +
                '</div>' +
                '<div class="hint-card" id="hintCard" style="display:none;">' +
                    '<div class="hint-title">' + config.cardTitle + '</div>' +
                    '<div class="hint-text">' + config.cardText + '</div>' +
                '</div>' +
            '</div>';
        
        UI.typeText(document.getElementById('hintBubble'), config.bubbleText, 30, function() {
            var card = document.getElementById('hintCard');
            card.style.display = 'block';
            card.appendChild(UI.createHintArrowButton(function() {
                Navigation.goTo(config.nextFn, config.nextSceneIndex);
            }));
        });
    }
    
    function render1() {
        render({
            sceneIndex: 6,
            bubbleText: 'Эта подсказка поможет мягко направить ребёнка.',
            cardTitle: 'Подсказка взрослому',
            cardText: '<strong>Вместе с ребёнком внимательно посмотрите на сцену.</strong>\n' +
                'Не торопитесь объяснять — важно дать ему самому заметить, что у героев что-то не получается.\n\n' +
                '<strong>Можно мягко направить вопросами:</strong>\n' +
                '— Что ты видишь?\n— У кого что происходит?\n— Почему им может быть неудобно играть вместе?\n\n' +
                '<strong>Будет здорово, если вы поможете ребёнку обратиться к его личному опыту:</strong>\n' +
                '— А у тебя так бывало?\n— Было ли, что вы с кем-то играли, но не сразу получилось договориться?\n— Как ты себя тогда чувствовал?\n\n' +
                'Когда ребёнок отвечает — поддержите: «Да, ты заметил…»\n\n' +
                '<em>Задача — помочь ребёнку проанализировать ситуацию, не давая готовых ответов.</em>',
            nextFn: VideoScene.renderSandbox,
            nextSceneIndex: 7
        });
    }
    
    function render2() {
        render({
            sceneIndex: 12,
            bubbleText: 'Эта подсказка поможет вам подготовиться к следующей игре!',
            cardTitle: 'Подсказка взрослому к следующей игре',
            cardText: '<strong>Предложите ребёнку вместе подумать, кто чем может заниматься в команде.</strong>\n' +
                'Важно не подсказывать сразу — пусть сначала попробует сам.\n\n' +
                '<strong>Можно поддержать вопросами:</strong>\n' +
                '— Как ты думаешь, кто это лучше всего умеет?\n— Почему ты так решил?\n\n' +
                '<strong>А ещё будет эффективнее, если добавить связь с личным опытом:</strong>\n' +
                '— А что бы делал ты?\n— Какие у тебя есть умения?\n— А у твоих друзей?\n— А у меня, как у взрослого?\n\n' +
                'Если ребёнку сложно — направьте внимание: «Посмотри, что он любит делать…»\n\n' +
                '<em>Задача — помочь ребёнку увидеть сильные стороны каждого.</em>',
            nextFn: Game2.renderIntro,
            nextSceneIndex: 13
        });
    }
    
    function render3() {
        render({
            sceneIndex: 17,
            bubbleText: 'Обратите внимание — сейчас героям снова понадобится помощь!',
            cardTitle: 'Подсказка взрослому',
            cardText: 'Сейчас важно показать ребёнку, что в команде можно договориться и распределить действия.\n' +
                'Здорово, если вы вновь соотнесёте игру с жизнью ребёнка:\n' +
                '— Как ты думаешь, если бы вы в садике или дома готовили обед вместе, кто бы что делал?\n' +
                '— А ты сам что бы хотел делать?\n— А что у тебя получается лучше всего?\n\n' +
                'Можно мягко направлять:\n— Давай попробуем распределить, как в настоящей команде.\n\n' +
                'Задача здесь — увидеть, что совместное действие требует договорённости, и перенести это на привычные ситуации ребёнка (садик, дом, игра).',
            nextFn: Game3.renderIntro,
            nextSceneIndex: 18
        });
    }
    
    return { render1, render2, render3 };
})();