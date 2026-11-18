// Детская игровая вселенная: карта, профили ребёнка, знакомство и подсказки.
const Universe = (function() {
    'use strict';

    var account = null;
    var activeChild = null;
    var active = false;
    var tutorialSteps = [
        { target: 'map', title: 'Карта волшебного леса', text: 'Здесь отмечены локации и игровые истории. Выбирай место на карте, чтобы отправиться в новое приключение.' },
        { target: 'adult', title: 'Профиль-аккаунт взрослого', text: 'Здесь находится аккаунт родителя или педагога: можно посмотреть прогресс и управлять профилями детей.' },
        { target: 'child', title: 'Профиль ребёнка', text: 'Здесь можно переключить ребёнка, добавить профиль или изменить имя. У каждого ребёнка свои истории и находки.' },
        { target: 'finds', title: 'Волшебный сундучок', text: 'Здесь хранятся награды за приключения и дополнительные материалы для творчества — их можно открыть и скачать.' },
        { title: 'Инвентарь ключей в игре', text: 'Во время игры нажми на значок ключика в верхней панели. За каждую пройденную серию ты получишь отдельный ключ: дружбы, заботы или команды.', inventory: true }
    ];
    var locations = [
        { id: 'gate', name: 'Вход в Волшебный лес', kind: 'intro', x: 12, y: 69, emblem: '✦', subtitle: 'Знакомство со Светлячком' },
        { id: 'trail', name: 'Тропинка дружбы', kind: 'waypoint', x: 30, y: 52, emblem: '♡', subtitle: 'Первая остановка' },
        { id: 'friendship', name: 'Домик Колобка', kind: 'story', series: 'friendship', x: 47, y: 30, emblem: '⌂', subtitle: 'Сила дружбы' },
        { id: 'care', name: 'Лесной детский сад', kind: 'story', series: 'care', x: 67, y: 57, emblem: '☼', subtitle: 'Сила заботы' },
        { id: 'teamwork', name: 'Лесная поляна', kind: 'story', series: 'teamwork', x: 87, y: 25, emblem: '✿', subtitle: 'Сила команды' },
        { id: 'compass-camp', name: 'Детский лагерь «Компас»', kind: 'coming-soon', direction: 'Подготовка к школе', x: 77, y: 82, emblem: '🧭', subtitle: 'Скоро · подготовка к школе' }
    ];

    function safeParse(value, fallback) {
        try { return value ? JSON.parse(value) : fallback; } catch (e) { return fallback; }
    }

    function emailKey() { return encodeURIComponent((account && account.email) || '').replace(/%/g, '_'); }
    function profilesKey() { return 'superkolobok-children-' + emailKey(); }
    function selectedKey() { return 'superkolobok-active-child-' + emailKey(); }

    function getChildren() {
        var result = safeParse(localStorage.getItem(profilesKey()), []);
        return Array.isArray(result) ? result : [];
    }

    function saveChildren(children) {
        try { localStorage.setItem(profilesKey(), JSON.stringify(children)); } catch (e) {}
    }

    function ensureProfile() {
        var children = getChildren();
        if (children.length) return children;
        var legacyName = typeof GameState !== 'undefined' ? GameState.getChildName() : '';
        children.push({
            id: 'child-' + Date.now().toString(36), name: legacyName || '', age: '', avatar: 'media/images/kolobok_avatar.png',
            tutorialStatus: 'new', createdAt: Date.now(), lastActiveAt: null
        });
        saveChildren(children);
        return children;
    }

    function getSelectedId(children) {
        var selected = localStorage.getItem(selectedKey());
        return children.some(function(child) { return child.id === selected; }) ? selected : children[0].id;
    }

    function startSession(userAccount, options) {
        account = userAccount || safeParse(localStorage.getItem('superkolobok-account'), null);
        if (!account || !account.email) return false;
        active = true;
        document.body.classList.add('public-mode', 'universe-mode');
        var children = ensureProfile();
        var selectedId = getSelectedId(children);
        if (children.length > 1 && !(options && options.skipChooser)) {
            renderProfileChooser(children);
            return true;
        }
        return selectChild(selectedId, { autoTour: true });
    }

    function resumeSession(email) {
        var userAccount = safeParse(localStorage.getItem('superkolobok-account'), null);
        if (!userAccount || userAccount.email !== email) return false;
        return startSession(userAccount);
    }

    function selectChild(id, options) {
        var children = getChildren();
        var child = children.find(function(entry) { return entry.id === id; });
        if (!child) return renderProfileChooser(children);
        activeChild = child;
        localStorage.setItem(selectedKey(), child.id);
        if (typeof GameState !== 'undefined') {
            GameState.setPersistenceScope(child.id);
            if (child.name && GameState.getChildName() !== child.name) GameState.setChildName(child.name);
            else if (!child.name && GameState.getChildName()) {
                child.name = GameState.getChildName();
                saveChildren(children);
            }
        }
        child.lastActiveAt = Date.now();
        saveChildren(children);
        renderMap();
        if (options && options.autoTour && child.tutorialStatus === 'new') showTutorial(true);
        return true;
    }

    function renderProfileChooser(children) {
        var root = document.getElementById('sceneContent');
        if (!root) return;
        document.body.classList.add('public-mode', 'universe-mode');
        var cards = children.map(function(child) {
            return '<button class="universe-profile-choice" type="button" data-child-id="' + escapeAttr(child.id) + '"><img src="' + escapeAttr(child.avatar || 'media/images/kolobok_avatar.png') + '" alt=""><span>' + escapeHtml(child.name || 'Новый профиль ребёнка') + '</span><small>' + (child.name ? 'Продолжить путешествие' : 'Знакомство ещё впереди') + '</small></button>';
        }).join('');
        root.innerHTML = '<section class="universe-chooser"><div class="universe-chooser-brand"><img src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и Светлячок"></div><p class="universe-eyebrow">КТО ОТПРАВИТСЯ В ПУТЕШЕСТВИЕ?</p><h1>Выберите профиль ребёнка</h1><div class="universe-profile-grid">' + cards + '<button class="universe-profile-add" id="addChildProfile" type="button"><span>＋</span><b>Добавить ребёнка</b></button></div><button class="universe-text-button" id="adultAreaFromChooser" type="button">Профиль взрослого</button></section>';
        root.querySelectorAll('[data-child-id]').forEach(function(button) {
            button.addEventListener('click', function() { selectChild(button.dataset.childId, { autoTour: true }); });
        });
        root.querySelector('#addChildProfile').addEventListener('click', function() { createChildProfile(); });
        root.querySelector('#adultAreaFromChooser').addEventListener('click', function() { openAdultPanel(); });
    }

    function createChildProfile() {
        var children = getChildren();
        var child = { id: 'child-' + Date.now().toString(36), name: '', age: '', avatar: 'media/images/kolobok_avatar.png', tutorialStatus: 'new', createdAt: Date.now(), lastActiveAt: null };
        children.push(child);
        saveChildren(children);
        selectChild(child.id, { autoTour: true });
    }

    function profileHeader() {
        var adultRole = account && account.role === 'teacher' ? 'Педагог' : 'Родитель';
        return '<header class="universe-topbar"><a class="universe-brand" href="#" data-map-home aria-label="На карту"><img src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок"></a><nav class="universe-nav" aria-label="Разделы игрового пространства"><button class="is-current" data-map-home type="button">Карта</button><button type="button" data-achievements data-tutorial="finds"><img class="universe-chest-icon" src="media/images/magic-chest.svg" alt="">Волшебный сундучок</button></nav><div class="universe-user-controls"><button class="universe-adult-chip" id="adultProfileButton" data-tutorial="adult" type="button" aria-label="Профиль взрослого и аккаунт" title="Профиль взрослого и аккаунт"><span class="universe-user-icon">' + (adultRole === 'Педагог' ? 'П' : 'В') + '</span><span><small>Взрослый</small><b>' + adultRole + '</b></span></button><button class="universe-child-chip" id="childProfileButton" data-tutorial="child" type="button"><img src="' + escapeAttr(activeChild.avatar || 'media/images/kolobok_avatar.png') + '" alt=""><span><small>Ребёнок</small><b>' + escapeHtml(activeChild.name || 'Мой профиль') + '</b></span><span class="universe-chevron">⌄</span></button><button class="universe-helper-button" id="fireflyHelperButton" type="button" data-tutorial="helper" aria-label="Спросить Светлячка"><img src="media/images/firefly.png" alt=""><span>Помощь</span></button></div></header>';
    }

    function renderMap() {
        var root = document.getElementById('sceneContent');
        if (!root || !active || !activeChild) return;
        document.body.classList.add('public-mode', 'universe-mode');
        var name = activeChild.name ? escapeHtml(activeChild.name) : 'путешественник';
        var data = locations.map(function(location) {
            var done = location.series && typeof GameState !== 'undefined' && GameState.isSeriesCompleted(location.series);
            var statusText = location.kind === 'coming-soon' ? 'Скоро' : (done ? 'Пройдено ✓' : (location.kind === 'intro' && activeChild.name ? 'Вход открыт ✓' : (location.kind === 'waypoint' ? 'Следующая остановка' : 'Открыто')));
            var nodeClass = location.kind === 'coming-soon' ? 'is-coming-soon' : (done ? 'is-complete' : 'is-available');
            return '<button type="button" class="universe-map-node ' + nodeClass + '" data-location="' + location.id + '" data-tutorial="location" style="--node-x:' + location.x + '%;--node-y:' + location.y + '%"><span class="universe-node-emblem">' + location.emblem + '</span><span class="universe-node-label"><b>' + location.name + '</b><small>' + statusText + '</small></span></button>';
        }).join('');
        var storyLocations = locations.filter(function(location) { return !!location.series; });
        var doneCount = storyLocations.filter(function(location) { return GameState.isSeriesCompleted(location.series); }).length;
        var total = storyLocations.length;
        root.innerHTML = '<div class="universe-shell">' + profileHeader() +
            '<main class="universe-main"><div class="universe-map-heading"><div><p class="universe-eyebrow">ТВОЁ СКАЗОЧНОЕ ПУТЕШЕСТВИЕ</p><h1>' + (activeChild.name ? escapeHtml(activeChild.name) + ', куда отправимся сегодня?' : 'Куда отправимся сегодня?') + '</h1><p>Выбирай открытую локацию и исследуй истории вместе с друзьями.</p></div><div class="universe-progress" data-tutorial="progress"><span class="universe-progress-mark">✦</span><span><b>' + doneCount + ' из ' + total + '</b><small>историй пройдено</small></span><div class="universe-progress-track"><i style="width:' + Math.round(doneCount / total * 100) + '%"></i></div></div></div>' +
            '<div class="universe-map-scroll" data-tutorial="map"><section class="universe-map-art" aria-label="Карта игрового мира Суперколобка"><svg class="universe-trail" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true"><path d="M115 402 C175 405 230 352 300 302 S405 180 470 174 S570 330 670 330 S805 145 870 145" fill="none" stroke="#fff9e9" stroke-width="23" stroke-linecap="round"/><path d="M115 402 C175 405 230 352 300 302 S405 180 470 174 S570 330 670 330 S805 145 870 145" fill="none" stroke="#e8aa50" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 17"/><path d="M520 390 C600 432 680 468 770 475" fill="none" stroke="#fff9e9" stroke-width="18" stroke-linecap="round"/><path d="M520 390 C600 432 680 468 770 475" fill="none" stroke="#9e8ad5" stroke-width="4" stroke-linecap="round" stroke-dasharray="7 12"/></svg><div class="universe-sun" aria-hidden="true"></div><div class="universe-hill hill-one" aria-hidden="true"></div><div class="universe-hill hill-two" aria-hidden="true"></div><div class="universe-forest forest-left" aria-hidden="true"><i></i><i></i><i></i></div><div class="universe-forest forest-right" aria-hidden="true"><i></i><i></i><i></i></div><div class="universe-pond" aria-hidden="true">〰</div><div class="universe-gate-art" aria-hidden="true"><i></i><i></i><span>✦</span></div><div class="universe-map-cloud cloud-one" aria-hidden="true">☁</div><div class="universe-map-cloud cloud-two" aria-hidden="true">☁</div><div class="universe-locations" data-tutorial="locations">' + data + '</div>' +
            '<div class="universe-firefly-on-map" aria-hidden="true"><img src="media/images/firefly.png" alt=""></div><div class="universe-map-note">Светлячок ждёт у входа в лес. Начни с калитки!</div></section></div>' +
            '<div class="universe-map-foot"><span>Путь открывается шаг за шагом</span><button class="universe-small-link" type="button" id="replayTour">Пройти знакомство с картой ещё раз</button></div></main></div>';
        root.querySelectorAll('[data-map-home]').forEach(function(button) { button.addEventListener('click', function(event) { event.preventDefault(); renderMap(); }); });
        root.querySelectorAll('[data-location]').forEach(function(button) { button.addEventListener('click', function() { openLocation(button.dataset.location); }); });
        root.querySelector('#adultProfileButton').addEventListener('click', openAdultPanel);
        root.querySelector('#childProfileButton').addEventListener('click', openChildPanel);
        root.querySelector('#fireflyHelperButton').addEventListener('click', openHelper);
        root.querySelector('[data-achievements]').addEventListener('click', openProgressPanel);
        root.querySelector('#replayTour').addEventListener('click', function() { showTutorial(false); });
    }

    function openLocation(id) {
        var location = locations.find(function(entry) { return entry.id === id; });
        if (!location) return;
        if (location.kind === 'coming-soon') return openOverlay(location.direction, '<div class="universe-camp-preview"><span class="universe-compass-icon" aria-hidden="true">🧭</span><div><b>' + escapeHtml(location.name) + '</b><p>Это отдельный путь подготовки к школе. Игры и задания для него появятся позже.</p></div></div>', [{ label: 'Буду ждать', action: closeOverlay }]);
        if (location.id !== 'gate' && !activeChild.name) return openOverlay('Знакомство впереди', '<p>Сначала войди в Волшебный лес — Светлячок поможет тебе познакомиться и собрать имя из букв.</p>', [{ label: 'К входу в лес', action: function() { closeOverlay(); openLocation('gate'); } }]);
        if (location.kind === 'intro') return renderGateScene();
        if (location.kind === 'waypoint') return openOverlay(location.name, '<p>Светлячок проведёт тебя по Тропинке дружбы к первому приключению — в Домик Колобка.</p>', [
            { label: 'К Домику Колобка', action: function() { closeOverlay(); openLocation('friendship'); } },
            { label: 'Остаться на карте', secondary: true, action: closeOverlay }
        ]);
        var seriesNames = { friendship:'Сила дружбы', care:'Сила заботы', teamwork:'Сила команды' };
        var completed = GameState.isSeriesCompleted(location.series);
        openOverlay(location.name, '<p class="universe-modal-kicker">' + seriesNames[location.series] + '</p><p>' + (completed ? 'Эту историю уже проходили. Можно вернуться к ней и снова исследовать сюжет.' : 'Открытая история ждёт тебя. Светлячок будет рядом, а взрослый сможет посмотреть, как проходит путешествие.') + '</p>', [
            { label: completed ? 'Повторить историю' : 'Начать историю', action: function() { closeOverlay(); launchStory(location.series); } },
            { label: 'Остаться на карте', secondary: true, action: closeOverlay }
        ]);
    }

    function renderGateScene() {
        var root = document.getElementById('sceneContent');
        if (!root) return;
        root.innerHTML = '<section class="universe-gate-scene"><button class="universe-back-map" id="gateBack">← На карту</button><div class="universe-gate-illustration"><div class="universe-gate-trees"><i></i><i></i><i></i></div><div class="universe-gate"><span>✦</span></div><img src="media/images/firefly.png" alt="Светлячок" class="universe-gate-firefly"></div><div class="universe-gate-dialog"><p class="universe-eyebrow">ВХОД В ВОЛШЕБНЫЙ ЛЕС</p><h1>' + (activeChild.name ? 'С возвращением, ' + escapeHtml(activeChild.name) + '!' : 'Привет! Я Светлячок.') + '</h1><p>' + (activeChild.name ? 'Рад снова тебя видеть! Сначала загляни на Тропинку дружбы — оттуда начнётся наше первое приключение.' : 'Я буду твоим проводником по этому миру. Давай познакомимся — как тебя зовут?') + '</p><div class="universe-gate-actions">' + (activeChild.name ? '<button class="universe-primary-button" id="gateToMap" type="button">Вернуться на карту</button><button class="universe-secondary-button" id="gateEditName" type="button">Изменить имя</button>' : '<button class="universe-primary-button" id="gateMeetFirefly" type="button">Собрать имя из букв</button>') + '</div></div></section>';
        root.querySelector('#gateBack').addEventListener('click', renderMap);
        var toMap = root.querySelector('#gateToMap'); if (toMap) toMap.addEventListener('click', renderMap);
        var editName = root.querySelector('#gateEditName'); if (editName) editName.addEventListener('click', startNameCubes);
        var meet = root.querySelector('#gateMeetFirefly'); if (meet) meet.addEventListener('click', startNameCubes);
    }

    function startNameCubes() {
        var options = { initialName: activeChild.name || '', onComplete: afterName, onCancel: renderMap };
        if (typeof Navigation !== 'undefined') Navigation.goTo(function() { NameScreen.render(options); }, 0);
        else NameScreen.render(options);
    }

    function afterName(name) {
        activeChild.name = name;
        saveChild();
        renderGateScene();
        var title = document.querySelector('.universe-gate-dialog h1');
        var copy = document.querySelector('.universe-gate-dialog>p:not(.universe-eyebrow)');
        if (title) title.textContent = 'Очень приятно, ' + name + '!';
        if (copy) copy.textContent = 'Теперь отправляйся на Тропинку дружбы — там начинается наше первое приключение.';
    }

    function launchStory(seriesId) {
        if (!activeChild.name) return renderGateScene();
        activeChild.lastActivityAt = Date.now();
        saveChild();
        document.body.classList.remove('public-mode', 'universe-mode');
        if (typeof AudioManager !== 'undefined') AudioManager.stopAll();
        if (typeof SeriesSelect !== 'undefined' && SeriesSelect.startStory) SeriesSelect.startStory(seriesId);
        else Navigation.goTo(SeriesSelect.render, 1);
    }

    function showTutorial(isAutomatic) {
        if (isAutomatic && activeChild.tutorialStatus !== 'new') return;
        var stepIndex = 0;
        activeChild.tutorialStatus = 'in_progress';
        saveChild();
        function paint() {
            var oldCard = document.querySelector('.universe-tour-card');
            if (oldCard) oldCard.remove();
            renderMap();
            var step = tutorialSteps[stepIndex];
            var root = document.getElementById('sceneContent');
            var anchor = step.target ? root.querySelector('[data-tutorial="' + step.target + '"]') : null;
            if (anchor && step.target) anchor.classList.add('universe-tutorial-highlight');
            var tutorial = document.createElement('div');
            tutorial.className = 'universe-tour-backdrop';
            root.appendChild(tutorial);
            var tourCard = document.createElement('section');
            tourCard.className = 'universe-tour-card';
            tourCard.setAttribute('role', 'dialog');
            tourCard.setAttribute('aria-modal', 'true');
            tourCard.setAttribute('aria-labelledby', 'universeTourTitle');
            tourCard.innerHTML = '<img src="media/images/firefly.png" alt="Светлячок" class="universe-tour-firefly"><div class="universe-tour-speech"><p class="universe-eyebrow">ЗНАКОМСТВО · ' + (stepIndex + 1) + ' / ' + tutorialSteps.length + '</p><h2 id="universeTourTitle">' + step.title + '</h2><p>' + step.text + '</p>' + (step.inventory ? '<div class="universe-tour-keys" aria-label="Ключи за серии"><span><img src="media/images/key-friendship.png" alt=""><b>Дружба</b></span><span><img src="media/images/key-care.svg" alt=""><b>Забота</b></span><span><img src="media/images/key-team.png" alt=""><b>Команда</b></span></div>' : '') + '</div><div class="universe-tour-actions"><button type="button" class="universe-text-button" data-tour-skip>Пропустить знакомство</button><button type="button" class="universe-primary-button" data-tour-next>' + (stepIndex === tutorialSteps.length - 1 ? 'На карту' : 'Дальше') + '</button></div>';
            document.body.appendChild(tourCard);
            tourCard.querySelector('[data-tour-skip]').addEventListener('click', finishTutorial);
            tourCard.querySelector('[data-tour-next]').addEventListener('click', function() {
                if (stepIndex < tutorialSteps.length - 1) { stepIndex += 1; paint(); }
                else finishTutorial();
            });
        }
        function finishTutorial() {
            var tourCard = document.querySelector('.universe-tour-card');
            if (tourCard) tourCard.remove();
            activeChild.tutorialStatus = 'complete';
            activeChild.tutorialCompletedAt = Date.now();
            saveChild();
            renderMap();
        }
        paint();
    }

    function openHelper() {
        openOverlay('Светлячок рядом', '<div class="universe-helper-message"><img src="media/images/firefly.png" alt=""><p>Я могу подсказать, как устроена карта. Пока я отвечаю по готовым подсказкам, а не с помощью ИИ.</p></div><div class="universe-quick-questions"><button type="button" data-helper="куда">Куда мне идти?</button><button type="button" data-helper="истории">Какие истории открыты?</button><button type="button" data-helper="тур">Покажи карту ещё раз</button></div><p class="universe-helper-answer" id="helperAnswer" aria-live="polite"></p>', [{ label: 'Понятно', action: closeOverlay }]);
        document.querySelectorAll('[data-helper]').forEach(function(button) {
            button.addEventListener('click', function() {
                var answer = document.getElementById('helperAnswer');
                if (button.dataset.helper === 'тур') { closeOverlay(); showTutorial(false); return; }
                answer.textContent = button.dataset.helper === 'куда' ? (activeChild.name ? activeChild.name + ', начни у входа в Волшебный лес, затем загляни на Тропинку дружбы.' : 'Сначала войди в Волшебный лес, чтобы познакомиться со Светлячком и собрать имя.') : 'На карте есть Тропинка дружбы и три игровые истории. Отдельный путь подготовки к школе скоро появится в лагере «Компас».';
            });
        });
    }

    function openChildPanel() {
        var children = getChildren();
        var items = children.map(function(child) {
            return '<button type="button" class="universe-switch-child" data-switch-child="' + escapeAttr(child.id) + '"><img src="' + escapeAttr(child.avatar || 'media/images/kolobok_avatar.png') + '" alt=""><span>' + escapeHtml(child.name || 'Новый профиль ребёнка') + '</span>' + (child.id === activeChild.id ? '<b>Выбран</b>' : '') + '</button>';
        }).join('');
        openOverlay('Профиль ребёнка', '<p>Выбери, чьё путешествие открыть.</p><div class="universe-switch-list">' + items + '</div>', [
            { label: 'Изменить имя', secondary: true, action: function() { closeOverlay(); showRenameDialog(); } },
            { label: 'Добавить ребёнка', action: function() { closeOverlay(); createChildProfile(); } },
            { label: 'Готово', secondary: true, action: closeOverlay }
        ]);
        document.querySelectorAll('[data-switch-child]').forEach(function(button) {
            button.addEventListener('click', function() { closeOverlay(); selectChild(button.dataset.switchChild, { autoTour: true }); });
        });
    }

    function openAdultPanel() {
        var children = getChildren();
        var completed = ['friendship','care','teamwork'].filter(function(id) { return GameState.isSeriesCompleted(id); }).length;
        var activities = activeChild.lastActivityAt ? 'Последняя активность: ' + new Date(activeChild.lastActivityAt).toLocaleDateString('ru-RU') : 'Пока нет сохранённой активности.';
        var childRows = children.map(function(child) { return '<div class="universe-adult-child"><img src="' + escapeAttr(child.avatar || 'media/images/kolobok_avatar.png') + '" alt=""><span><b>' + escapeHtml(child.name || 'Имя пока не указано') + '</b><small>' + (child.id === activeChild.id ? activities : 'Профиль ребёнка') + '</small></span><button type="button" data-adult-switch="' + escapeAttr(child.id) + '">Открыть</button></div>'; }).join('');
        openOverlay('Профиль ' + (account.role === 'teacher' ? 'педагога' : 'родителя'), '<p class="universe-modal-kicker">' + escapeHtml(account.name || account.email) + '</p><div class="universe-progress-summary"><b>' + escapeHtml(activeChild.name || 'Профиль ребёнка') + '</b><span>' + completed + ' из 3 историй пройдено</span></div><p>Показываем только сохранённые отметки о прохождении историй. Это игровая информация для совместного обсуждения, не оценка ребёнка.</p><div class="universe-switch-list">' + childRows + '</div>', [
            { label: 'Добавить ребёнка', action: function() { closeOverlay(); createChildProfile(); } },
            { label: 'Выйти из аккаунта', secondary: true, action: logout }
        ]);
        document.querySelectorAll('[data-adult-switch]').forEach(function(button) { button.addEventListener('click', function() { closeOverlay(); selectChild(button.dataset.adultSwitch, { autoTour: true }); }); });
    }

    function openProgressPanel() {
        var completed = locations.filter(function(location) { return location.series && GameState.isSeriesCompleted(location.series); });
        var stars = GameState.getStars();
        var rewards = completed.length ? '<div class="universe-find-reward-list">' + completed.map(function(location) {
            return '<div class="universe-find-reward"><span class="universe-find-reward-star">★</span><span><b>' + escapeHtml(location.name) + '</b><small>' + escapeHtml(location.subtitle) + ' · пройдено</small></span></div>';
        }).join('') + '</div>' : '<p class="universe-empty-find">Пока здесь тихо. Первые награды появятся после игровых историй.</p>';
        var materials = GameState.getMaterials();
        var catalog = {
            'series1-materials.pdf': { title:'Творческие материалы к серии «Сила дружбы»', description:'Задания и идеи для продолжения истории вместе со взрослым.' },
            'series2-materials.pdf': { title:'Творческие материалы к серии «Сила заботы»', description:'Дополнительные задания и материалы для совместного творчества.' },
            'series3-materials.pdf': { title:'Творческие материалы к серии «Сила команды»', description:'Материалы к истории о сотрудничестве и общих решениях.' }
        };
        var materialCards = materials.map(function(file) {
            var item = catalog[file];
            if (!item) return '';
            return '<article class="universe-material-card"><span class="universe-material-icon" aria-hidden="true">✂</span><div><b>' + item.title + '</b><p>' + item.description + '</p></div><a href="media/bonus/' + encodeURIComponent(file) + '" target="_blank" rel="noopener noreferrer">Посмотреть</a></article>';
        }).join('');
        var materialSection = materialCards ? '<div class="universe-find-materials">' + materialCards + '</div>' : '<p class="universe-empty-find">Материалы для творчества будут появляться здесь по мере прохождения историй.</p>';
        var body = '<div class="universe-chest-intro"><img src="media/images/magic-chest.svg" alt=""><p>Здесь хранятся награды и дополнительные материалы для творчества ' + escapeHtml(activeChild.name || 'ребёнка') + '.</p></div><section class="universe-finds-section"><div class="universe-finds-title"><h3>Награды</h3><span>' + completed.length + ' из 3 историй</span></div><div class="universe-star-award"><span class="universe-star-row">' + '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars)) + '</span><b>' + stars + ' звёзд за приключения</b></div>' + rewards + '</section><section class="universe-finds-section"><div class="universe-finds-title"><h3>Материалы для творчества</h3><span>для совместных занятий</span></div>' + materialSection + '</section><p class="universe-muted-note">Ключи за серии хранятся отдельно — в игровом инвентаре.</p>';
        openOverlay('Волшебный сундучок', body, [{ label: 'На карту', action: closeOverlay }]);
    }

    function showRenameDialog() {
        openOverlay('Изменить имя ребёнка', '<label class="universe-form-label" for="universeChildName">Имя</label><input id="universeChildName" class="universe-text-input" maxlength="32" value="' + escapeAttr(activeChild.name || '') + '">', [
            { label: 'Сохранить', action: function() { var input = document.getElementById('universeChildName'); if (input.value.trim()) { activeChild.name = input.value.trim().slice(0,32); GameState.setChildName(activeChild.name); saveChild(); } closeOverlay(); renderMap(); } },
            { label: 'Отмена', secondary: true, action: closeOverlay }
        ]);
    }

    function openOverlay(title, body, actions) {
        closeOverlay();
        var root = document.getElementById('sceneContent');
        if (!root) return;
        var overlay = document.createElement('div');
        overlay.className = 'universe-dialog-backdrop';
        overlay.id = 'universeDialogBackdrop';
        overlay.innerHTML = '<section class="universe-dialog" role="dialog" aria-modal="true" aria-labelledby="universeDialogTitle"><button type="button" class="universe-dialog-close" aria-label="Закрыть">×</button><p class="universe-eyebrow">МИР СУПЕРКОЛОБКА</p><h2 id="universeDialogTitle">' + escapeHtml(title) + '</h2><div class="universe-dialog-body">' + body + '</div><div class="universe-dialog-actions"></div></section>';
        root.appendChild(overlay);
        overlay.querySelector('.universe-dialog-close').addEventListener('click', closeOverlay);
        var actionsNode = overlay.querySelector('.universe-dialog-actions');
        actions.forEach(function(item) {
            var button = document.createElement('button');
            button.type = 'button'; button.className = item.secondary ? 'universe-secondary-button' : 'universe-primary-button'; button.textContent = item.label;
            button.addEventListener('click', item.action); actionsNode.appendChild(button);
        });
    }

    function closeOverlay() {
        var overlay = document.getElementById('universeDialogBackdrop');
        if (overlay) overlay.remove();
    }

    function logout() {
        closeOverlay();
        localStorage.removeItem('superkolobok-session');
        active = false; activeChild = null; account = null;
        document.body.classList.remove('universe-mode');
        if (typeof PublicPages !== 'undefined') PublicPages.renderLanding();
    }

    function saveChild() {
        if (!activeChild) return;
        var children = getChildren();
        var index = children.findIndex(function(child) { return child.id === activeChild.id; });
        if (index >= 0) { children[index] = activeChild; saveChildren(children); }
    }

    function syncProgress() {
        if (!activeChild || typeof GameState === 'undefined') return;
        activeChild.completedSeries = {
            friendship: GameState.isSeriesCompleted('friendship'),
            care: GameState.isSeriesCompleted('care'),
            teamwork: GameState.isSeriesCompleted('teamwork')
        };
        activeChild.lastActivityAt = Date.now();
        saveChild();
    }

    function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function(char) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]; }); }
    function escapeAttr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }

    return {
        startSession: startSession,
        resumeSession: resumeSession,
        isActive: function() { return active; },
        renderMap: renderMap,
        showTutorial: showTutorial,
        syncProgress: syncProgress,
        logout: logout,
        openRenameDialog: showRenameDialog
    };
})();
