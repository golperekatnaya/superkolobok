// Публичные страницы проекта: лендинг и локальные экраны аккаунта.
const PublicPages = (function() {
    'use strict';

    var root = null;

    function renderLanding() {
        root = document.getElementById('sceneContent');
        if (!root) return;
        document.body.classList.add('public-mode');
        root.innerHTML = `
            <div class="public-site" id="top">
                <header class="public-nav">
                    <a class="brand" href="#top" aria-label="Суперколобок — на главную"><img class="brand-wordmark" src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и его друзья"></a>
                    <nav class="public-links" aria-label="Навигация">
                        <a href="#about">О проекте</a><a href="#stories">Игровые истории</a><a href="#parents">Для родителей</a><a href="#teachers">Для педагогов</a>
                    </nav>
                    <button class="public-login" type="button" data-page="login">Игровое пространство</button>
                    <button class="mobile-menu" type="button" aria-label="Открыть разделы" aria-expanded="false">Меню</button>
                </header>
                <main>
                    <section class="landing-hero" id="project">
                        <div class="hero-copy">
                            <p class="eyebrow">ДЕТСКОЕ РАЗВИВАЮЩЕЕ ЦИФРОВОЕ ПРОСТРАНСТВО</p>
                            <h1>Суперколобок<br>и его друзья</h1>
                            <p class="hero-subtitle">Интерактивные мульт-игры для детей 4–7 лет</p>
                            <p class="hero-lead">Игровые истории, в которых ребёнок становится участником событий: знакомится с героями, сталкивается с разными ситуациями, выбирает, как поступить, и узнаёт, к чему приводят его решения.</p>
                            <div class="hero-actions"><button class="primary-cta" type="button" data-page="register">Перейти к игровому пространству <span aria-hidden="true">→</span></button><a class="text-cta" href="#how">Как устроен проект <span aria-hidden="true">↓</span></a></div>
                            <p class="audience-note">Для детей 4–7 лет</p>
                        </div>
                        <figure class="hero-art">
                            <img class="hero-art-main" src="media/images/friendpower_card.png" alt="Кадр игровой истории о дружбе Колобка и Зайчонка">
                            <div class="hero-art-detail"><img src="media/images/kolobok_avatar.png" alt="Колобок"><span>Истории, в которых можно действовать</span></div>
                            <figcaption>Оригинальные герои и игровые ситуации проекта</figcaption>
                        </figure>
                    </section>

                    <section class="about-section public-section" id="about">
                        <div class="about-visual"><img src="media/images/series1-thumb.png" alt="Кадр мульт-игры Суперколобок и его друзья"><span>Игровая история</span></div>
                        <div class="about-copy"><p class="section-kicker">О ПРОЕКТЕ</p><h2>Здесь ребёнок становится участником истории</h2>
                            <p>Вместе с Колобком и его друзьями ребёнок отправляется в игровые истории, в которых герои сталкиваются с разными ситуациями, учатся понимать друг друга, договариваться и искать решения.</p>
                            <p>Ребёнок наблюдает за происходящим, выполняет задания, взаимодействует с игровыми элементами и влияет на развитие событий.</p>
                        </div>
                    </section>

                    <section class="stories-section public-section" id="stories">
                        <div class="section-heading"><p class="section-kicker">ВНУТРИ ПРОЕКТА</p><h2>Исследовать, выбирать, пробовать</h2><p>Каждая игровая история предлагает ребёнку свою ситуацию, задания и возможность попробовать разные способы действия.</p></div>
                        <div class="story-cards">
                            <article class="story-card story-card-wide"><img src="media/images/friendpower_card.png" alt="Колобок и Зайчонок в игровой истории о дружбе"><div><span>01</span><h3>Интерактивные истории</h3><p>Ребёнок знакомится с героями, следит за развитием событий и становится участником мультимедийной истории.</p></div></article>
                            <article class="story-card story-card-offset"><img src="media/images/card_care.png" alt="Кадр истории о заботе"><div><span>02</span><h3>Игровые задания</h3><p>Выполняет задания, взаимодействует с предметами и игровыми элементами, ищет ответы и пробует свои решения.</p></div></article>
                            <article class="story-card story-card-wide"><img src="media/images/series2-thumb.png" alt="Карта игровой истории проекта"><div><span>03</span><h3>Выбор и последствия</h3><p>Принимает решения в игровых ситуациях и наблюдает, как его действия влияют на дальнейшее развитие истории.</p></div></article>
                        </div>
                    </section>

                    <section class="process-section public-section" id="how">
                        <div class="section-heading"><p class="section-kicker">ИГРОВОЙ ПОДХОД</p><h2>От игровой ситуации к собственному решению</h2></div>
                        <div class="process-steps">
                            <article class="process-step"><span class="process-number">01</span><div><h3>Знакомство с ситуацией</h3><p>Герои оказываются в ситуации, в которой нужно разобраться.</p></div></article>
                            <article class="process-step"><span class="process-number">02</span><div><h3>Действие и выбор</h3><p>Ребёнок выполняет задание, выбирает вариант действия или предлагает своё решение.</p></div></article>
                            <article class="process-step"><span class="process-number">03</span><div><h3>Результат и обсуждение</h3><p>Ребёнок видит, к чему приводит его решение, и может обсудить произошедшее со взрослым.</p></div></article>
                        </div>
                        <p class="process-note">Это общий взгляд на игровой подход проекта: отдельные истории могут быть устроены по-разному.</p>
                    </section>

                    <section class="characters-section public-section" id="characters">
                        <div class="section-heading"><p class="section-kicker">ГЕРОИ ИСТОРИЙ</p><h2>Знакомьтесь: друзья Суперколобка</h2><p>Каждый герой — часть историй, в которых ребёнок учится замечать важное, понимать других и взаимодействовать с окружающим миром.</p></div>
                        <div class="character-grid">
                            <article class="character-card character-kolobok"><div><img src="media/images/kolobok_avatar.png" alt="Колобок"></div><h3>Колобок</h3></article>
                            <article class="character-card"><div><img src="media/images/series1-rabbit-neutral.png" alt="Заяц"></div><h3>Заяц</h3></article>
                            <article class="character-card"><div><img src="media/images/series1-soroka-open.png" alt="Сорока"></div><h3>Сорока</h3></article>
                            <article class="character-card"><div class="hedgehogs"><img src="media/images/sonya.svg" alt="Ёжик Соня"><img src="media/images/tonya.svg" alt="Ёжик Тоня"></div><h3>Ёжики</h3></article>
                            <article class="character-card"><div><img src="media/images/grandpa.png" alt="Дедушка"></div><h3>Дедушка</h3></article>
                            <article class="character-card"><div><img src="media/images/series1-grandma-bean.png" alt="Бабушка Фасоль"></div><h3>Бабушка Фасоль</h3></article>
                            <article class="character-card character-firefly"><div><img src="media/images/firefly.png" alt="Светлячок"></div><h3>Светлячок</h3></article>
                        </div>
                    </section>

                    <section class="audience-section public-section" id="audience">
                        <div class="audience-intro"><p class="section-kicker">ВМЕСТЕ СО ВЗРОСЛЫМИ</p><h2>Игра, которую можно продолжить в жизни</h2><p>Игровые истории могут стать поводом поговорить с ребёнком о ситуациях, чувствах, поступках и отношениях с окружающими. Взрослый помогает ребёнку осмыслить игровой опыт и перенести его в повседневную жизнь.</p></div>
                        <div class="audience-cards">
                            <article class="audience-card parent-card" id="parents"><span class="audience-label">ДЛЯ СЕМЬИ</span><h3>Для родителей</h3><p>Проводите время вместе, обсуждайте игровые ситуации и помогайте ребёнку находить слова для собственных мыслей и чувств.</p><a href="#parents">Проект для родителей <span aria-hidden="true">→</span></a></article>
                            <article class="audience-card teacher-card" id="teachers"><span class="audience-label">ДЛЯ ОБРАЗОВАНИЯ</span><h3>Для педагогов</h3><p>Используйте игровые истории и задания как дополнительный материал для занятий, бесед и воспитательной работы с детьми.</p><a href="#teachers">Проект для педагогов <span aria-hidden="true">→</span></a></article>
                        </div>
                    </section>

                    <section class="recognition-section public-section" id="recognition">
                        <div class="recognition-date">КИвО<br><b>2025</b></div><div><p class="section-kicker">ПРОФЕССИОНАЛЬНОЕ СООБЩЕСТВО</p><h2>Признание проекта</h2><p>Проект «Суперколобок и его друзья» вошёл в ТОП-100 КИвО-2025. Команда проекта также получила отдельное специальное признание от Фонда «Наше будущее».</p></div>
                    </section>

                    <section class="team-section public-section" id="team">
                        <div><p class="section-kicker">КОМАНДА ПРОЕКТА</p><h2>Проект создаёт команда «Моего университета»</h2></div>
                        <div class="team-copy"><p>«Суперколобок и его друзья» — проект команды АНО ДПО «Мой университет», объединяющий образовательную экспертизу, методическую разработку, цифровые технологии и мультимедийный контент.</p><p>Мы разрабатываем игровые сценарии, образовательные материалы и цифровые решения, которые помогают сделать обучение и развитие детей содержательными и доступными.</p><a href="https://moi-universitet.ru/" target="_blank" rel="noopener noreferrer">Сайт «Моего университета» <span aria-hidden="true">↗</span></a></div>
                    </section>

                    <section class="final-cta">
                        <div class="final-characters"><img src="media/images/kolobok_avatar.png" alt="Колобок"><img src="media/images/zaychonok.svg" alt="Заяц"><img src="media/images/firefly.png" alt="Светлячок"></div>
                        <div><p class="section-kicker">ВАШЕ ПУТЕШЕСТВИЕ НАЧИНАЕТСЯ ЗДЕСЬ</p><h2>Готовы познакомиться с миром Суперколобка?</h2><p>Отправляйтесь вместе с Колобком и его друзьями в игровые истории, где каждый ребёнок может попробовать себя в новой роли, выполнить задания и найти собственные решения.</p><button class="primary-cta" type="button" data-page="register">Перейти к игровому пространству <span aria-hidden="true">→</span></button></div>
                    </section>
                </main>
                <footer class="public-footer"><a href="#top" class="footer-brand"><img src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и его друзья"></a><nav aria-label="Разделы сайта"><a href="#about">О проекте</a><a href="#stories">Игровые истории</a><a href="#parents">Родителям</a><a href="#teachers">Педагогам</a></nav><span>Для семей · образовательных организаций · педагогического сообщества</span></footer>
            </div>`;
        bindCommon();
        var menu = root.querySelector('.mobile-menu');
        if (menu) menu.addEventListener('click', function() {
            var links = root.querySelector('.public-links');
            var open = links.classList.toggle('is-open');
            menu.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function renderAuth(mode) {
        root = document.getElementById('sceneContent');
        if (!root) return;
        document.body.classList.add('public-mode');
        var isRegister = mode === 'register';
        root.innerHTML = '<div class="auth-page ' + (isRegister ? 'auth-register' : 'auth-login') + '">' +
            '<aside class="auth-aside ' + (isRegister ? 'aside-purple' : 'aside-peach') + '">' +
                '<a class="brand auth-brand" href="#" data-page="landing"><img class="brand-wordmark" src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и Светлячок"></a>' +
                '<div class="aside-copy"><h1>' + (isRegister ? 'Создаём ваш<br>сказочный мир' : 'Сказка начинается<br>здесь') + '</h1><p>' + (isRegister ? 'Зарегистрируйтесь, чтобы сохранять истории, достижения и прогресс ребёнка.' : 'Войдите, чтобы продолжить путешествие по сказочному миру вместе с Колобком.') + '</p></div>' +
                '<div class="auth-media-row"><div class="aside-illustration"><video class="aside-loader" autoplay muted loop playsinline preload="metadata" poster="media/images/kolobok_avatar.png" aria-label="Колобок катится"><source src="media/videos/Loader.mov" type="video/quicktime"></video></div><p class="aside-tagline">Качусь и учусь</p></div>' +
            '</aside>' +
            '<section class="auth-main"><button class="auth-back" type="button" data-page="landing">← <span>На главную</span></button>' +
                '<div class="auth-form-wrap"><div class="auth-mobile-brand"><img class="brand-wordmark" src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и Светлячок"></div>' +
                    '<h2>' + (isRegister ? 'Регистрация' : 'Вход в аккаунт') + '</h2><p class="auth-subtitle">' + (isRegister ? 'Создайте аккаунт взрослого, который будет управлять профилем ребёнка.' : 'Продолжите с того места, где остановились.') + '</p>' +
                    '<form id="accountForm" novalidate>' +
                        (isRegister ? '<label for="accountName">Ваше имя</label><input id="accountName" name="name" autocomplete="name" placeholder="Как к вам обращаться" required maxlength="60">' : '') +
                        '<label for="accountEmail">Электронная почта</label><input id="accountEmail" name="email" type="email" autocomplete="email" placeholder="Введите e-mail" required>' +
                        '<label for="accountPassword">Пароль</label><input id="accountPassword" name="password" type="password" autocomplete="' + (isRegister ? 'new-password' : 'current-password') + '" placeholder="' + (isRegister ? 'Придумайте пароль (не менее 8 символов)' : 'Введите пароль') + '" required minlength="8">' +
                        (isRegister ? '<label for="accountPasswordRepeat">Повторите пароль</label><input id="accountPasswordRepeat" name="passwordRepeat" type="password" autocomplete="new-password" placeholder="Введите пароль ещё раз" required minlength="8"><label class="terms-label"><input type="checkbox" name="terms" required><span>Согласен(на) с условиями использования и политикой конфиденциальности</span></label>' : '<button class="forgot-link" id="forgotPassword" type="button">Забыли пароль?</button>') +
                        '<p class="auth-message" id="authMessage" aria-live="polite"></p><button class="auth-submit ' + (isRegister ? 'submit-orange' : 'submit-purple') + '" type="submit">' + (isRegister ? 'Создать аккаунт' : 'Войти') + '</button>' +
                    '</form><p class="auth-switch">' + (isRegister ? 'Уже есть аккаунт? <button type="button" data-page="login">Войти</button>' : 'Ещё нет аккаунта? <button type="button" data-page="register">Создать аккаунт</button>') + '</p>' +
                    (isRegister ? '' : '<p class="auth-local-note">Аккаунт доступен в этом браузере.</p>') +
                '</div>' +
                (isRegister ? '' : '<p class="auth-legal">Продолжая, вы принимаете условия использования и политику конфиденциальности.</p>') +
            '</section></div>';
        bindCommon();
        bindForm(isRegister);
    }

    function bindCommon() {
        root.querySelectorAll('[data-page]').forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                var page = button.getAttribute('data-page');
                if (page === 'landing') renderLanding();
                else renderAuth(page);
                var content = document.getElementById('sceneContent');
                if (content) content.scrollTop = 0;
            });
        });
    }

    function bindForm(isRegister) {
        var form = document.getElementById('accountForm');
        var message = document.getElementById('authMessage');
        if (!form) return;
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            message.textContent = '';
            message.className = 'auth-message';
            if (!form.reportValidity()) return;
            var email = form.elements.email.value.trim().toLowerCase();
            var password = form.elements.password.value;
            var account;
            try { account = JSON.parse(localStorage.getItem('superkolobok-account') || 'null'); } catch (e) { account = null; }
            if (isRegister) {
                if (password.length < 8) return showMessage('Пароль должен содержать не менее 8 символов.', true);
                if (password !== form.elements.passwordRepeat.value) return showMessage('Пароли не совпадают.', true);
                if (!form.elements.terms.checked) return showMessage('Чтобы продолжить, примите условия использования.', true);
                if (account && account.email === email) return showMessage('Аккаунт с такой почтой уже есть. Войдите.', true);
                if (!window.crypto || !window.crypto.subtle) return showMessage('Создание аккаунта доступно при защищённом соединении.', true);
                var salt = randomSalt();
                derivePassword(password, salt).then(function(hash) {
                    localStorage.setItem('superkolobok-account', JSON.stringify({ name: form.elements.name.value.trim(), email: email, salt: salt, passwordHash: hash }));
                    localStorage.setItem('superkolobok-session', email);
                    enterGame();
                }).catch(function() { showMessage('Не удалось создать аккаунт. Попробуйте ещё раз.', true); });
                return;
            }
            if (!account || account.email !== email) return showMessage('Аккаунт с такой почтой не найден. Создайте аккаунт.', true);
            if (!window.crypto || !window.crypto.subtle) return showMessage('Вход доступен при защищённом соединении.', true);
            derivePassword(password, account.salt).then(function(hash) {
                if (hash !== account.passwordHash) return showMessage('Проверьте почту и пароль.', true);
                localStorage.setItem('superkolobok-session', email);
                enterGame();
            }).catch(function() { showMessage('Не удалось выполнить вход. Попробуйте ещё раз.', true); });
        });
        var forgot = document.getElementById('forgotPassword');
        if (forgot) forgot.addEventListener('click', function() {
            showMessage('Восстановление по почте пока недоступно. Аккаунт хранится только в этом браузере.', false);
        });
        function showMessage(text, isError) {
            message.textContent = text;
            message.className = 'auth-message ' + (isError ? 'is-error' : 'is-info');
        }
    }

    function randomSalt() {
        var bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    }

    function derivePassword(password, saltHex) {
        var salt = new Uint8Array(saltHex.match(/.{2}/g).map(function(part) { return parseInt(part, 16); }));
        return window.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
            .then(function(key) { return window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 120000, hash: 'SHA-256' }, key, 256); })
            .then(function(bits) { return Array.from(new Uint8Array(bits)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join(''); });
    }

    function enterGame() {
        document.body.classList.remove('public-mode');
        if (typeof AudioManager !== 'undefined') AudioManager.stopAll();
        Navigation.goTo(NameScreen.render, 0);
    }

    return { renderLanding: renderLanding, renderAuth: renderAuth, enterGame: enterGame };
})();
