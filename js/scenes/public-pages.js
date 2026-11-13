// Публичные страницы проекта: лендинг и локальные экраны аккаунта.
const PublicPages = (function() {
    'use strict';

    var root = null;

    function renderLanding() {
        root = document.getElementById('sceneContent');
        if (!root) return;
        document.body.classList.add('public-mode');
        root.innerHTML =
            '<div class="public-site">' +
                '<header class="public-nav">' +
                    '<a class="brand" href="#top" aria-label="Суперколобок — на главную"><img class="brand-wordmark" src="media/images/logo-superkolobok.svg" alt="Суперколобок"></a>' +
                    '<nav class="public-links" aria-label="Навигация"><a href="#project">О проекте</a><a href="#children">Детям</a><a href="#parents">Родителям</a><a href="#teachers">Педагогам</a></nav>' +
                    '<button class="public-login" type="button" data-page="login">Войти</button>' +
                    '<button class="mobile-menu" type="button" aria-label="Открыть разделы" aria-expanded="false">☰</button>' +
                '</header>' +
                '<main id="top">' +
                    '<section class="landing-hero" id="project">' +
                        '<div class="hero-copy"><span class="eyebrow"><i></i> СЕМЕЙНЫЙ ПРОЕКТ</span>' +
                            '<h1>Сказочные истории,<br>которые помогают расти</h1>' +
                            '<p class="hero-lead">Вместе с Колобком ребёнок исследует мир, учится понимать себя и других, пробует новое и находит собственные решения.</p>' +
                            '<div class="hero-actions"><button class="primary-cta" type="button" data-page="register">Начать путешествие <span aria-hidden="true">→</span></button><a class="text-cta" href="#about">Узнать о проекте <span aria-hidden="true">→</span></a></div>' +
                            '<p class="audience-note">Для детей, родителей и педагогов</p>' +
                        '</div>' +
                        '<div class="hero-art" aria-label="Колобок и Светлячок отправляются в путешествие"><div class="art-sun"></div><div class="art-hill"></div><div class="art-water"></div><div class="art-firefly"><img src="media/images/firefly.png" alt="Светлячок"></div><img class="art-kolobok" src="media/images/kolobok_avatar.png" alt="Колобок"><span class="art-caption">Впереди — целый сказочный мир</span></div>' +
                    '</section>' +
                    '<section class="feature-section" id="children"><h2>Что ждёт ребёнка в сказочном мире</h2><div class="feature-grid">' +
                        '<article class="feature-card"><span class="feature-dot dot-pink"></span><h3>Истории и открытия</h3><p>Серии и сюжеты, в которых ребёнок наблюдает, задаёт вопросы и узнаёт новое.</p></article>' +
                        '<article class="feature-card" id="parents"><span class="feature-dot dot-blue"></span><h3>Задания и игры</h3><p>Практические задания помогают действовать, выбирать, сравнивать и пробовать.</p></article>' +
                        '<article class="feature-card" id="teachers"><span class="feature-dot dot-yellow"></span><h3>Развитие и общение</h3><p>Темы для разговоров о чувствах, поступках, дружбе и повседневных ситуациях.</p></article>' +
                    '</div></section>' +
                    '<section class="story-section" id="about"><div class="story-mark">✦</div><div><span class="story-kicker">ПУТЕШЕСТВИЕ, КОТОРОЕ ПРОДОЛЖАЕТСЯ ДОМА</span><h2>Расти легче, когда рядом друзья</h2><p>Колобок и Светлячок зовут ребёнка в истории о дружбе, заботе и командной работе. После мультфильма можно обсудить героев, выполнить небольшое задание и заметить, как эти идеи встречаются в жизни.</p></div><button class="story-cta" type="button" data-page="register">Познакомиться с героями <span aria-hidden="true">→</span></button></section>' +
                '</main>' +
                '<footer class="public-footer"><span>Суперколобок</span><span>Для семей · образовательных организаций · педагогического сообщества</span></footer>' +
            '</div>';
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
                '<a class="brand auth-brand" href="#" data-page="landing">' + (isRegister ? '<span class="brand-mark"><img src="media/images/brand-mark.svg" alt="Суперколобок"></span>' : '<img class="brand-wordmark" src="media/images/logo-superkolobok.svg" alt="Суперколобок">') + '</a>' +
                '<div class="aside-copy"><h1>' + (isRegister ? 'Создаём ваш<br>сказочный мир' : 'Сказка начинается<br>здесь') + '</h1><p>' + (isRegister ? 'Зарегистрируйтесь, чтобы сохранять истории, достижения и прогресс ребёнка.' : 'Войдите, чтобы продолжить путешествие по сказочному миру вместе с Колобком.') + '</p></div>' +
                '<div class="aside-illustration"><img src="' + (isRegister ? 'media/images/firefly.png' : 'media/images/kolobok_avatar.png') + '" alt="' + (isRegister ? 'Светлячок' : 'Колобок') + '"></div>' +
            '</aside>' +
            '<section class="auth-main"><button class="auth-back" type="button" data-page="landing">← <span>На главную</span></button>' +
                '<div class="auth-form-wrap"><div class="auth-mobile-brand"><img class="brand-wordmark" src="media/images/logo-superkolobok.svg" alt="Суперколобок"></div>' +
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
