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
                            <p class="eyebrow">ИНТЕРАКТИВНЫЕ МУЛЬТ-ИГРЫ · 4–7 ЛЕТ</p>
                            <h1>У каждого решения есть своя история</h1>
                            <p class="hero-subtitle">Колобок и друзья помогают детям учиться дружить, понимать чувства и действовать вместе.</p>
                            <div class="hero-actions"><button class="primary-cta" type="button" data-page="register">Начать путешествие <span aria-hidden="true">→</span></button></div>
                        </div>
                        <figure class="hero-art">
                            <video class="hero-art-main hero-intro-video" autoplay muted loop playsinline preload="auto" poster="media/images/friendpower_card.png" aria-label="Беззвучная заставка проекта «Суперколобок»"><source src="media/videos/superkolobok-splash.mp4" type="video/mp4"></video>
                            <figcaption>Звук отключён</figcaption>
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
                            <article class="story-card story-card-materials"><div class="materials-preview-pair"><figure><img src="media/images/bonus-stickers-preview.jpg" alt="Лист со стикерами Колобка из игрового материала"><figcaption>Стикеры</figcaption></figure><figure><img src="media/images/bonus-heart-preview.jpg" alt="Печатная открытка «Отпечаток сердца»"><figcaption>Открытка</figcaption></figure><figure><img src="media/images/bonus-puzzle-preview.jpg" alt="Печатный пазл «Песочный город» с героями проекта"><figcaption>Пазл</figcaption></figure></div><div><span>04</span><h3>Материалы для игры и творчества</h3><p>Печатные задания, карточки и материалы для творчества, методические рекомендации для педагогов, а также подсказки и советы взрослым, вовлечённым в воспитание ребёнка.</p></div></article>
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
                        <div class="character-groups">
                          <section class="character-group character-group-adults" aria-labelledby="adult-characters-title">
                            <div class="character-group-heading"><div><p class="character-group-eyebrow">ПОДДЕРЖКА И НАСТАВНИКИ</p><h3 id="adult-characters-title">Взрослые и ведущие</h3></div><p>Помогают героям, делятся опытом и сопровождают в путешествии.</p></div>
                            <div class="character-grid">
                            <button class="character-card" type="button" data-character="firefly"><span class="character-art"><img src="media/images/firefly.png" alt=""></span><span class="character-name">Светлячок</span><span class="character-hint">Главный ведущий <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card character-bear-educator" type="button" data-character="medveditsa"><span class="character-art"><img src="media/images/medvezhonok.png" alt=""></span><span class="character-name">Медведица-воспитательница</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="grandma"><span class="character-art"><img src="media/images/series1-grandma-bean.png" alt=""></span><span class="character-name">Бабушка Фасоль</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="grandpa"><span class="character-art"><img src="media/images/series1-grandpa.png" alt=""></span><span class="character-name">Дедушка</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            </div>
                          </section>
                          <section class="character-group character-group-kids" aria-labelledby="child-characters-title">
                            <div class="character-group-heading"><div><p class="character-group-eyebrow">ДЕТСКИЕ ПЕРСОНАЖИ</p><h3 id="child-characters-title">Дети</h3></div><p>Друзья, которые вместе с ребёнком исследуют мир и учатся новому.</p></div>
                            <div class="character-grid">
                            <button class="character-card character-kolobok" type="button" data-character="kolobok"><span class="character-art"><img src="media/images/series1-kolobok-neutral.png" alt=""></span><span class="character-name">Колобок</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="zaychonok"><span class="character-art"><img src="media/images/series1-rabbit-neutral.png" alt=""></span><span class="character-name">Зайчонок</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="sonya"><span class="character-art"><img src="media/images/series1-sonya.png" alt=""></span><span class="character-name">Ёжиха Соня</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="tonya"><span class="character-art"><img src="media/images/series1-tonya.png" alt=""></span><span class="character-name">Ёжиха Тоня</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            <button class="character-card" type="button" data-character="medvezhonok"><span class="character-art"><img src="media/images/medvezhonok.png" alt=""></span><span class="character-name">Медвежонок</span><span class="character-hint">Открыть направление <span aria-hidden="true">↗</span></span></button>
                            </div>
                          </section>
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
                        <div class="recognition-date">КИвО<br><b>2025</b></div><div class="recognition-copy"><p class="section-kicker">ПРОФЕССИОНАЛЬНОЕ СООБЩЕСТВО</p><h2>Признание проекта</h2><p>Проект «Суперколобок и его друзья» вошёл в ТОП-100 КИвО-2025. Команда проекта также получила отдельное специальное признание от Фонда «Наше будущее».</p></div><a class="recognition-certificate" href="media/images/kivo-2025-certificate.jpg" target="_blank" rel="noopener noreferrer" aria-label="Открыть сертификат КИвО-2025 в полном размере"><img src="media/images/kivo-2025-certificate.jpg" alt="Сертификат участника конкурса инноваций в образовании КИвО-2025 для проекта «Колобок. Секреты дружелюбного общения»"><span>Смотреть сертификат <span aria-hidden="true">↗</span></span></a>
                    </section>

                    <section class="reviews-section public-section" id="reviews" aria-labelledby="reviews-title">
                        <div class="section-heading reviews-heading"><p class="section-kicker">ОТЗЫВЫ СЕМЕЙ И ПЕДАГОГОВ</p><h2 id="reviews-title">Истории тех, кто уже познакомился с проектом</h2><p>Листайте впечатления родителей, бабушек и воспитательниц. Нажмите на отзыв, чтобы прочитать его крупнее.</p></div>
                        <div class="reviews-carousel" aria-roledescription="карусель отзывов">
                            <button class="reviews-arrow reviews-prev" type="button" aria-label="Предыдущий отзыв">←</button>
                            <button class="review-card" type="button" aria-haspopup="dialog" aria-label="Открыть отзыв крупнее"><span class="review-stars" aria-hidden="true">✦ ✦ ✦</span><span class="review-quote"></span><span class="review-author"></span><span class="review-open-hint">Читать отзыв <span aria-hidden="true">↗</span></span></button>
                            <button class="reviews-arrow reviews-next" type="button" aria-label="Следующий отзыв">→</button>
                        </div>
                        <div class="reviews-pagination" role="group" aria-label="Выбрать отзыв"></div>
                        <div class="reviews-dialog-backdrop" hidden><section class="reviews-dialog" role="dialog" aria-modal="true" aria-labelledby="reviewDialogTitle" aria-describedby="reviewDialogQuote" tabindex="-1"><button class="reviews-dialog-close" type="button" aria-label="Закрыть отзыв">×</button><span class="review-stars" aria-hidden="true">✦ ✦ ✦</span><p class="reviews-dialog-quote" id="reviewDialogQuote"></p><h3 id="reviewDialogTitle"></h3><p class="reviews-dialog-source">Отзыв из презентации проекта</p></section></div>
                    </section>

                    <section class="team-section public-section" id="team">
                        <div class="team-heading"><p class="section-kicker">КОМАНДА ПРОЕКТА</p><h2>Проект создаёт команда «Моего университета»</h2><a class="university-logo-link" href="https://moi-universitet.ru/" target="_blank" rel="noopener noreferrer" aria-label="Сайт «Моего университета»"><img src="media/images/logo-my-university.png" alt="Логотип «Моего университета»"><span>АНО ДПО «Мой университет» <span aria-hidden="true">↗</span></span></a></div>
                        <div class="team-copy"><p>Идею проекта вместе разработали Вероника, Алина, Ирина и Тимофей. «Суперколобок и его друзья» объединяет образовательную экспертизу, методическую разработку, цифровые технологии и мультимедийный контент.</p><p>Каждый участник команды отвечает за свою часть проекта — от сценариев и иллюстраций до разработки приложения и методических решений.</p></div>
                        <div class="team-members" aria-label="Участники команды">
                            <article class="team-member"><div class="team-member-head"><img class="team-member-photo" src="media/images/team-veronika.jpg" alt="Филипченко Вероника Сергеевна, руководитель проекта"><h3>Филипченко Вероника Сергеевна</h3></div><p>Руководитель проекта, сценарист сюжетов и разработчик приложения. Также озвучивает Светлячка.</p></article>
                            <article class="team-member"><div class="team-member-head"><span class="team-member-avatar" aria-hidden="true">А</span><h3>Лазарева Алина Тимофеевна</h3></div><p>Работает над сценариями, иллюстрациями, анимацией и дополнительными материалами. Также озвучивает персонажей.</p></article>
                            <article class="team-member"><div class="team-member-head"><span class="team-member-avatar" aria-hidden="true">И</span><h3>Арефьева Ирина Львовна</h3></div><p>Разрабатывает методическую основу сценариев, координирует процессы и сроки, работает с фокус-группами.</p></article>
                            <article class="team-member"><div class="team-member-head"><span class="team-member-avatar" aria-hidden="true">Т</span><h3>Лазарев Тимофей Васильевич</h3></div><p>Участвует в разработке методической основы, анализе рынка и потребностей, учитывает особенности восприятия аудитории.</p></article>
                        </div>
                        <div class="team-voice-section"><p class="section-kicker">АВТОРЫ ОЗВУЧКИ И ПЕРВЫЙ ТЕСТИРОВЩИК</p><div class="team-voice-members" aria-label="Авторы озвучки и тестировщик">
                            <article class="team-member"><div class="team-member-head"><span class="team-member-avatar" aria-hidden="true">В</span><h3>Миронов Владимир Русланович</h3></div><p>Озвучивает Дедушку и помогал организовать тестирование проекта детьми и родителями.</p></article>
                            <article class="team-member"><div class="team-member-head"><span class="team-member-avatar" aria-hidden="true">Е</span><h3>Ева</h3></div><p>Озвучивает Зайчонка и стала первым маленьким тестировщиком игрового пространства.</p></article>
                        </div></div>
                        <div class="team-video-block"><div class="team-video-copy"><p class="section-kicker">РАССКАЗ ОТ РУКОВОДИТЕЛЯ</p><h3>Вероника Филипченко о проекте</h3><p>Руководитель проекта рассказывает о замысле и игровом мире «Суперколобка и его друзей».</p></div><div class="team-video-frame"><video controls playsinline preload="none" poster="media/images/veronika-video-poster.jpg" aria-label="Видеообращение Вероники Филипченко о проекте «Суперколобок и его друзья»"><source src="media/videos/veronika-project-intro.mp4" type="video/mp4"></video></div></div>
                    </section>

                    <section class="final-cta">
                        <div class="final-sandbox-art"><img src="media/images/series1-kolobok-sandbox.png" alt="Колобок играет в песочнице"></div>
                        <div><p class="section-kicker">ВАШЕ ПУТЕШЕСТВИЕ НАЧИНАЕТСЯ ЗДЕСЬ</p><h2>Готовы познакомиться с миром Суперколобка?</h2><p>Отправляйтесь вместе с Колобком и его друзьями в игровые истории, где каждый ребёнок может попробовать себя в новой роли, выполнить задания и найти собственные решения.</p><button class="primary-cta" type="button" data-page="register">Перейти к игровому пространству <span aria-hidden="true">→</span></button></div>
                    </section>
                </main>
                <footer class="public-footer"><a href="#top" class="footer-brand">Суперколобок и его друзья <span aria-hidden="true">↑</span></a><nav aria-label="Разделы сайта"><a href="#about">О проекте</a><a href="#stories">Игровые истории</a><a href="#parents">Родителям</a><a href="#teachers">Педагогам</a></nav><span>Для семей · образовательных организаций · педагогического сообщества</span></footer>
            </div>`;
        root.scrollTop = 0;
        bindCommon();
        bindCharacterCards();
        bindTestimonials();
        bindLandingMotion();
        var menu = root.querySelector('.mobile-menu');
        if (menu) menu.addEventListener('click', function() {
            var links = root.querySelector('.public-links');
            var open = links.classList.toggle('is-open');
            menu.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function bindLandingMotion() {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var introVideo = root.querySelector('.hero-intro-video');
        if (reducedMotion && introVideo) {
            introVideo.pause();
            introVideo.removeAttribute('autoplay');
        } else if (introVideo) {
            introVideo.muted = true;
            introVideo.defaultMuted = true;
            introVideo.autoplay = true;
            introVideo.playsInline = true;
            var attemptIntroPlayback = function() {
                if (introVideo.paused) introVideo.play().catch(function() {});
            };
            introVideo.addEventListener('canplay', attemptIntroPlayback, { once: true });
            attemptIntroPlayback();
        }
        if (!('IntersectionObserver' in window) || reducedMotion) return;
        var targets = root.querySelectorAll('.hero-copy, .hero-art, .about-visual, .about-copy, .section-heading, .story-card, .reviews-carousel, .reviews-pagination, .process-step, .character-group-heading, .character-card, .audience-intro, .audience-card, .recognition-section > *, .team-heading, .team-copy, .team-video-block, .team-member, .final-cta > *');
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            });
        }, { root: root, threshold: 0.06, rootMargin: '0px 0px -48px 0px' });
        var sectionCounts = new Map();
        targets.forEach(function(target) {
            target.classList.add('scroll-reveal');
            var section = target.closest('.public-section, .landing-hero, .final-cta') || target;
            var index = sectionCounts.get(section) || 0;
            sectionCounts.set(section, index + 1);
            target.style.setProperty('--reveal-delay', Math.min(index, 4) * 90 + 'ms');
            observer.observe(target);
        });
    }

    function bindTestimonials() {
        var section = root.querySelector('.reviews-section');
        if (!section) return;
        var reviews = [
            { role: 'Воспитательница', quote: 'Грамотно сделано, хорошая анимация, не перегружена картинка; ребёнок развивается комплексно: эмоционально-волевая сфера, когнитивная, эстетическое воспитание, формирование личностных качеств.' },
            { role: 'Валентина, бабушка', quote: 'Мне понравилось, что ситуации здесь понятны ребёнку и действительно близки его жизни. Герои приятные, речь хорошая, всё легко воспринимается. Чувствуется, что сделано с душой.' },
            { role: 'Елена, мама', quote: 'Дочке 5 лет, смотрела с удовольствием. Очень красочный и позитивный, то что нужно для ребёнка. Мне как маме тоже очень понравилось.' },
            { role: 'Воспитательница', quote: 'Мне было интересно, понравился выбор лексики ведущего, выбор конфликтных ситуаций. Мультфильм предлагает проблемные ситуации, которые точно уже встречались в жизни ребёнка… Учит размышлять, прежде чем действовать…' },
            { role: 'Воспитательница', quote: 'В своей работе я тоже планирую его использовать во время адаптации детей или сложных и конфликтных ситуациях. Сам мультфильм сделан прекрасно! Чёткие персонажи, понятная речь и инструкции.' },
            { role: 'Дарья, мама', quote: 'Ребёнку 7 лет было интересно (за гоночную машинку отдельное спасибо, очень оценили :). Смотрел увлечённо, подача понравилась. Он вспоминал ситуации со своими друзьями, сравнивал…' }
        ];
        var index = 0;
        var card = section.querySelector('.review-card');
        var quote = section.querySelector('.review-quote');
        var author = section.querySelector('.review-author');
        var dots = section.querySelector('.reviews-pagination');
        var dialogBackdrop = section.querySelector('.reviews-dialog-backdrop');
        var closeButton = section.querySelector('.reviews-dialog-close');
        var dialogQuote = section.querySelector('.reviews-dialog-quote');
        var dialogTitle = section.querySelector('#reviewDialogTitle');
        function render() {
            var review = reviews[index];
            card.classList.add('is-changing');
            window.setTimeout(function() {
                quote.textContent = '«' + review.quote + '»';
                author.textContent = review.role;
                card.setAttribute('aria-label', 'Открыть отзыв: ' + review.role);
                dots.querySelectorAll('button').forEach(function(dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                    dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
                });
                card.classList.remove('is-changing');
            }, 130);
        }
        reviews.forEach(function(_, dotIndex) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'reviews-dot';
            dot.setAttribute('aria-label', 'Отзыв ' + (dotIndex + 1));
            dot.addEventListener('click', function() { index = dotIndex; render(); });
            dots.appendChild(dot);
        });
        section.querySelector('.reviews-prev').addEventListener('click', function() { index = (index + reviews.length - 1) % reviews.length; render(); });
        section.querySelector('.reviews-next').addEventListener('click', function() { index = (index + 1) % reviews.length; render(); });
        card.addEventListener('click', function() {
            var review = reviews[index];
            dialogQuote.textContent = '«' + review.quote + '»';
            dialogTitle.textContent = review.role;
            dialogBackdrop.hidden = false;
            closeButton.focus();
        });
        function closeDialog() {
            dialogBackdrop.hidden = true;
            card.focus();
            document.removeEventListener('keydown', onKeydown);
        }
        function onKeydown(event) { if (event.key === 'Escape' && !dialogBackdrop.hidden) closeDialog(); }
        closeButton.addEventListener('click', closeDialog);
        dialogBackdrop.addEventListener('click', function(event) { if (event.target === dialogBackdrop) closeDialog(); });
        card.addEventListener('click', function() { document.addEventListener('keydown', onKeydown); });
        render();
    }

    function bindCharacterCards() {
        var characters = {
            kolobok: {
                name: 'Колобок', image: 'media/images/series1-kolobok-neutral.png',
                direction: 'Лидерство и командная работа',
                description: 'Истории Колобка развивают способность принимать решения и справляться с изменениями.'
            },
            zaychonok: {
                name: 'Зайчонок', image: 'media/images/series1-rabbit-neutral.png',
                direction: 'Эмоциональный интеллект и личностное развитие',
                description: 'Через его истории дети учатся понимать свои чувства, просить о помощи и принимать особенности себя и других.'
            },
            sonya: {
                name: 'Ёжиха Соня', image: 'media/images/series1-sonya.png',
                direction: 'Креативное и адаптивное мышление',
                description: 'Соня помогает детям искать нестандартные решения.'
            },
            tonya: {
                name: 'Ёжиха Тоня', image: 'media/images/series1-tonya.png',
                direction: 'Проектное мышление',
                description: 'С Тоней дети знакомятся с планированием, созданием идей и работой над результатом.'
            },
            medvezhonok: {
                name: 'Медвежонок', image: 'media/images/medvezhonok.png',
                direction: 'Духовно-нравственное и гражданское развитие',
                description: 'Его направление — уважение к традициям, семье и окружающим.'
            },
            medveditsa: {
                name: 'Медведица-воспитательница', image: 'media/images/medvezhonok.png',
                direction: 'Воспитание и поддержка ребёнка',
                description: 'Медведица-воспитательница помогает ребёнку исследовать новое, задаёт поддерживающие вопросы и связывает игровые открытия с повседневным опытом.'
            },
            firefly: {
                name: 'Светлячок', image: 'media/images/firefly.png',
                direction: 'Проводник по миру проекта',
                description: 'Светлячок помогает детям в доступной форме знакомиться с основами искусственного интеллекта.'
            },
            grandma: {
                name: 'Бабушка Фасоль', image: 'media/images/series1-grandma-bean.png',
                direction: 'Взрослый наставник и семейная поддержка',
                description: 'Вместе с дедушкой Бабушка Фасоль раскрывает в историях заботу, поддержку, семейные ценности и доверительное общение между поколениями.'
            },
            grandpa: {
                name: 'Дедушка Колобка', image: 'media/images/series1-grandpa.png',
                direction: 'Взрослый наставник и семейная поддержка',
                description: 'Вместе с бабушкой Дедушка Колобка раскрывает в историях заботу, поддержку, передачу опыта, семейные ценности и доверительное общение между поколениями.'
            }
        };
        root.querySelectorAll('[data-character]').forEach(function(card) {
            card.addEventListener('click', function() {
                var character = characters[card.getAttribute('data-character')];
                if (!character) return;
                var backdrop = document.createElement('div');
                backdrop.className = 'character-dialog-backdrop';
                backdrop.innerHTML = '<section class="character-dialog" role="dialog" aria-modal="true" aria-labelledby="characterDialogTitle" aria-describedby="characterDialogDescription" tabindex="-1"><button class="character-dialog-close" type="button" aria-label="Закрыть">×</button><img class="character-dialog-portrait" alt=""><div class="character-dialog-kicker">НАПРАВЛЕНИЕ В МУЛЬТ-ИГРАХ</div><h2 id="characterDialogTitle"></h2><h3 class="character-dialog-direction"></h3><p id="characterDialogDescription"></p></section>';
                backdrop.querySelector('.character-dialog-portrait').src = character.image;
                backdrop.querySelector('.character-dialog-portrait').alt = character.name;
                backdrop.querySelector('#characterDialogTitle').textContent = character.name;
                backdrop.querySelector('.character-dialog-direction').textContent = character.direction;
                backdrop.querySelector('#characterDialogDescription').textContent = character.description;
                document.body.appendChild(backdrop);
                var closeButton = backdrop.querySelector('.character-dialog-close');
                function closeDialog() {
                    backdrop.remove();
                    card.focus();
                    document.removeEventListener('keydown', onKeydown);
                }
                function onKeydown(event) { if (event.key === 'Escape') closeDialog(); }
                closeButton.addEventListener('click', closeDialog);
                backdrop.addEventListener('click', function(event) { if (event.target === backdrop) closeDialog(); });
                document.addEventListener('keydown', onKeydown);
                closeButton.focus();
            });
        });
    }

    function renderAuth(mode) {
        root = document.getElementById('sceneContent');
        if (!root) return;
        document.body.classList.add('public-mode');
        var isRegister = mode === 'register';
        root.innerHTML = '<div class="auth-page ' + (isRegister ? 'auth-register' : 'auth-login') + '">' +
            '<aside class="auth-aside ' + (isRegister ? 'aside-purple' : 'aside-peach') + '">' +
                '<a class="brand auth-brand" href="#" data-page="landing"><img class="brand-wordmark ' + (isRegister ? 'auth-brand-backed' : '') + '" src="' + (isRegister ? 'media/images/logo-superkolobok-firefly-backed.png' : 'media/images/logo-superkolobok-firefly.svg') + '" alt="Суперколобок и Светлячок"></a>' +
                '<div class="aside-copy"><h1>' + (isRegister ? 'Создаём ваш<br>сказочный мир' : 'Мир Суперколобка<br>и его друзей') + '</h1><p>' + (isRegister ? 'Зарегистрируйтесь, чтобы сохранять истории, достижения и прогресс ребёнка.' : 'Игровые истории о дружбе, заботе и совместных решениях — для детей и взрослых.') + '</p></div>' +
            '</aside>' +
            '<section class="auth-main"><button class="auth-back" type="button" data-page="landing">← <span>На главную</span></button>' +
                '<div class="auth-form-wrap"><div class="auth-mobile-brand"><img class="brand-wordmark" src="media/images/logo-superkolobok-firefly.svg" alt="Суперколобок и Светлячок"></div>' +
                    '<h2>' + (isRegister ? 'Регистрация' : 'Вход в аккаунт') + '</h2>' + '<div class="auth-motion-row"><div class="auth-motion-video"><video autoplay muted loop playsinline preload="metadata" poster="media/images/kolobok_avatar.png" aria-label="Колобок катится"><source src="media/videos/Loader.mov" type="video/quicktime"><source src="media/videos/Loader.webm" type="video/webm"></video></div></div>' + (isRegister ? '<p class="auth-subtitle">Создайте аккаунт взрослого, который будет управлять профилем ребёнка.</p>' : '') +
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
