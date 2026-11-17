// Детская игровая вселенная: карта, профили ребёнка, знакомство и подсказки.
const Universe = (function() {
    'use strict';

    var account = null;
    var activeChild = null;
    var active = false;
    var tutorialSteps = [
        { target: 'map', title: 'Вот наша карта', text: 'Здесь находятся все места, которые мы будем исследовать.' },
        { target: 'locations', title: 'Выбирай локацию', text: 'Каждая локация ведёт к новой игровой истории. Начать можно с открытой.' },
        { target: 'progress', title: 'Путешествие продолжается', text: 'Пройденные истории отмечаются на карте, и ты всегда можешь вернуться к ним.' },
        { target: 'helper', title: 'Я рядом', text: 'Если забудешь, куда идти, нажми на меня — подскажу, как устроена карта.' }
    ];
    var locations = [
        { id: 'gate', name: 'Калитка в лес', kind: 'intro', x: 13, y: 61, emblem: '✦', subtitle: 'Точка начала путешествия' },
        { id: 'friendship', name: 'Поляна дружбы', kind: 'story', series: 'friendship', x: 39, y: 34, emblem: '♡', subtitle: 'Сила дружбы' },
        { id: 'care', name: 'Тёплый домик', kind: 'story', series: 'care', x: 66, y: 56, emblem: '☼', subtitle: 'Сила заботы' },
        { id: 'teamwork', name: 'Лесная поляна', kind: 'story', series: 'teamwork', x: 86, y: 26, emblem: '✿', subtitle: 'Сила команды' }
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
        return '<header class="universe-topbar"><a class="universe-brand" href="#" data-map-home aria-label="На карту"><img src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок"></a><nav class="universe-nav" aria-label="Разделы игрового пространства"><button class="is-current" data-map-home type="button">Карта</button><button type="button" data-achievements>Мои находки</button></nav><div class="universe-user-controls"><button class="universe-adult-chip" id="adultProfileButton" type="button"><span class="universe-user-icon">' + (adultRole === 'Педагог' ? 'П' : 'В') + '</span><span><small>Взрослый</small><b>' + adultRole + '</b></span></button><button class="universe-child-chip" id="childProfileButton" type="button"><img src="' + escapeAttr(activeChild.avatar || 'media/images/kolobok_avatar.png') + '" alt=""><span><small>Ребёнок</small><b>' + escapeHtml(activeChild.name || 'Мой профиль') + '</b></span><span class="universe-chevron">⌄</span></button><button class="universe-helper-button" id="fireflyHelperButton" type="button" data-tutorial="helper" aria-label="Спросить Светлячка"><img src="media/images/firefly.png" alt=""><span>Помощь</span></button></div></header>';
    }

    function renderMap() {
        var root = document.getElementById('sceneContent');
        if (!root || !active || !activeChild) return;
        document.body.classList.add('public-mode', 'universe-mode');
        var name = activeChild.name ? escapeHtml(activeChild.name) : 'путешественник';
        var data = locations.map(function(location) {
            var done = location.series && typeof GameState !== 'undefined' && GameState.isSeriesCompleted(location.series);
            var statusText = done ? 'Пройдено ✓' : (location.kind === 'intro' && activeChild.name ? 'Знакомство ✓' : 'Открыто');
            return '<button type="button" class="universe-map-node ' + (done ? 'is-complete' : 'is-available') + '" data-location="' + location.id + '" data-tutorial="location" style="--node-x:' + location.x + '%;--node-y:' + location.y + '%"><span class="universe-node-emblem">' + location.emblem + '</span><span class="universe-node-label"><b>' + location.name + '</b><small>' + statusText + '</small></span></button>';
        }).join('');
        var doneCount = locations.filter(function(location) { return location.series && GameState.isSeriesCompleted(location.series); }).length;
        var total = locations.length - 1;
        root.innerHTML = '<div class="universe-shell">' + profileHeader() +
            '<main class="universe-main"><div class="universe-map-heading"><div><p class="universe-eyebrow">ТВОЁ СКАЗОЧНОЕ ПУТЕШЕСТВИЕ</p><h1>' + (activeChild.name ? escapeHtml(activeChild.name) + ', куда отправимся сегодня?' : 'Куда отправимся сегодня?') + '</h1><p>Выбирай открытую локацию и исследуй истории вместе с друзьями.</p></div><div class="universe-progress" data-tutorial="progress"><span class="universe-progress-mark">✦</span><span><b>' + doneCount + ' из ' + total + '</b><small>историй пройдено</small></span><div class="universe-progress-track"><i style="width:' + Math.round(doneCount / total * 100) + '%"></i></div></div></div>' +
            '<div class="universe-map-scroll" data-tutorial="map"><section class="universe-map-art" aria-label="Карта игрового мира Суперколобка"><svg class="universe-trail" viewBox="0 0 1000 580" preserveAspectRatio="none" aria-hidden="true"><path d="M115 375 C155 390 185 355 223 327 S315 252 378 230 S454 293 502 330 S600 400 655 365 S715 291 770 255 S840 176 880 145" fill="none" stroke="#fff9e9" stroke-width="23" stroke-linecap="round"/><path d="M115 375 C155 390 185 355 223 327 S315 252 378 230 S454 293 502 330 S600 400 655 365 S715 291 770 255 S840 176 880 145" fill="none" stroke="#e8aa50" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 17"/></svg><div class="universe-sun" aria-hidden="true"></div><div class="universe-hill hill-one" aria-hidden="true"></div><div class="universe-hill hill-two" aria-hidden="true"></div><div class="universe-forest forest-left" aria-hidden="true"><i></i><i></i><i></i></div><div class="universe-forest forest-right" aria-hidden="true"><i></i><i></i><i></i></div><div class="universe-pond" aria-hidden="true">〰</div><div class="universe-gate-art" aria-hidden="true"><i></i><i></i><span>✦</span></div><div class="universe-map-cloud cloud-one" aria-hidden="true">☁</div><div class="universe-map-cloud cloud-two" aria-hidden="true">☁</div><div class="universe-locations" data-tutorial="locations">' + data + '</div>' +
            '<div class="universe-firefly-on-map" aria-hidden="true"><img src="media/images/firefly.png" alt=""></div><div class="universe-map-note">Начни с Калитки в лесу — там тебя уже ждёт Светлячок!</div></section></div>' +
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
        if (location.id !== 'gate' && !activeChild.name) return openOverlay('Знакомство впереди', '<p>Сначала зайди в Калитку в лес — Светлячок поможет собрать имя из букв.</p>', [{ label: 'К Калитке в лес', action: function() { closeOverlay(); openLocation('gate'); } }]);
        if (location.kind === 'intro') return renderGateScene();
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
        root.innerHTML = '<section class="universe-gate-scene"><button class="universe-back-map" id="gateBack">← На карту</button><div class="universe-gate-illustration"><div class="universe-gate-trees"><i></i><i></i><i></i></div><div class="universe-gate"><span>✦</span></div><img src="media/images/firefly.png" alt="Светлячок" class="universe-gate-firefly"></div><div class="universe-gate-dialog"><p class="universe-eyebrow">КАЛИТКА В ЛЕС</p><h1>' + (activeChild.name ? 'С возвращением, ' + escapeHtml(activeChild.name) + '!' : 'Привет! Я Светлячок.') + '</h1><p>' + (activeChild.name ? 'Рад снова тебя видеть. За калиткой начинаются наши игровые истории.' : 'Буду твоим проводником по этому миру. Давай познакомимся — как тебя зовут?') + '</p><div class="universe-gate-actions">' + (activeChild.name ? '<button class="universe-primary-button" id="gateToMap" type="button">Вернуться на карту</button><button class="universe-secondary-button" id="gateEditName" type="button">Изменить имя</button>' : '<button class="universe-primary-button" id="gateMeetFirefly" type="button">Собрать имя из букв</button>') + '</div></div></section>';
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
        if (copy) copy.textContent = 'Теперь мы можем отправляться в путешествие. Выбери открытую историю на карте.';
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
            renderMap();
            var step = tutorialSteps[stepIndex];
            var root = document.getElementById('sceneContent');
            var anchor = root.querySelector('[data-tutorial="' + step.target + '"]');
            if (anchor) anchor.classList.add('universe-tutorial-highlight');
            var tutorial = document.createElement('div');
            tutorial.className = 'universe-tour-backdrop';
            tutorial.innerHTML = '<section class="universe-tour-card" role="dialog" aria-modal="true" aria-labelledby="universeTourTitle"><img src="media/images/firefly.png" alt="" class="universe-tour-firefly"><div><p class="universe-eyebrow">ЗНАКОМСТВО · ' + (stepIndex + 1) + ' / ' + tutorialSteps.length + '</p><h2 id="universeTourTitle">' + step.title + '</h2><p>' + step.text + '</p></div><div class="universe-tour-actions"><button type="button" class="universe-text-button" data-tour-skip>Пропустить знакомство</button><button type="button" class="universe-primary-button" data-tour-next>' + (stepIndex === tutorialSteps.length - 1 ? 'На карту' : 'Дальше') + '</button></div></section>';
            root.appendChild(tutorial);
            tutorial.querySelector('[data-tour-skip]').addEventListener('click', finishTutorial);
            tutorial.querySelector('[data-tour-next]').addEventListener('click', function() {
                if (stepIndex < tutorialSteps.length - 1) { stepIndex += 1; paint(); }
                else finishTutorial();
            });
        }
        function finishTutorial() {
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
                answer.textContent = button.dataset.helper === 'куда' ? (activeChild.name ? activeChild.name + ', начни с любой открытой точки на карте.' : 'Сначала загляни в Калитку в лес, чтобы познакомиться и собрать имя.') : 'На карте доступны Калитка в лес и три игровые истории: дружба, забота и сила команды.';
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
        var items = locations.filter(function(location) { return location.series; }).map(function(location) {
            var done = GameState.isSeriesCompleted(location.series);
            return '<li><span>' + location.name + '</span><b>' + (done ? 'Пройдено ✓' : 'Ещё впереди') + '</b></li>';
        }).join('');
        openOverlay('Мои находки', '<p>Вот что уже сохранено в путешествии ' + escapeHtml(activeChild.name || 'ребёнка') + ':</p><ul class="universe-progress-list">' + items + '</ul><p class="universe-muted-note">Звёзды и отметки появляются только после прохождения игровых историй.</p>', [{ label: 'На карту', action: closeOverlay }]);
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
