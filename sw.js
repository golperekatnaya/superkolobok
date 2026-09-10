// ========== Service Worker "Суперколобок" ==========

const CACHE_NAME = 'superkolobok-v20260910-1';
const DYNAMIC_CACHE = 'superkolobok-dynamic-v20260910-1';

// Пути ОТНОСИТЕЛЬНЫЕ — работают в подпапке /superkolobok/ на GitHub Pages
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/config.js',
  './js/state.js',
  './js/progress.js',
  './js/audio.js',
  './js/navigation.js',
  './js/ui/components.js',
  './js/ui/popup.js',
  './js/ui/pwa.js',
  './js/scenes/name-screen.js',
  './js/scenes/series-select.js',
  './js/scenes/video-scene.js',
  './js/scenes/hint-screen.js',
  './js/scenes/game1.js',
  './js/scenes/game2.js',
  './js/scenes/game3.js',
  './js/scenes/test.js',
  './js/scenes/finale.js',
  './data/scenes.json',
  './media/images/web-app-manifest-192x192.png',
  './media/images/web-app-manifest-512x512.png',
  './media/images/favicon.svg',
  './media/images/favicon-96x96.png',
  './media/images/favicon.ico',
  './media/images/apple-touch-icon.png',
  './media/images/firefly.png',
  './media/images/kolobok.svg',
  './media/images/play-btn.svg',
  './media/images/kolobok-progress.png',
  './media/images/key-icon.png'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', function (event) {
  console.log('[SW] Установка...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[SW] Кеширование статических файлов...');
        return Promise.allSettled(
          STATIC_ASSETS.map(function (url) {
            return cache.add(url).catch(function (err) {
              console.warn('[SW] Не удалось закешировать:', url, err);
            });
          })
        );
      })
      .then(function () {
        console.log('[SW] Статические файлы закешированы');
        return self.skipWaiting();
      })
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', function (event) {
  console.log('[SW] Активация...');

  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (key) {
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
              console.log('[SW] Удаление старого кеша:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(function () {
        console.log('[SW] Активирован');
        return self.clients.claim();
      })
  );
});

// ========== ПЕРЕХВАТ ЗАПРОСОВ ==========
self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);

  // Чужие домены не трогаем
  if (url.origin !== self.location.origin) {
    return;
  }

  // Сам sw.js не перехватываем — иначе браузер не сможет его обновить
  if (url.pathname.endsWith('/sw.js')) {
    return;
  }

  // ВИДЕО и АУДИО — пропускаем напрямую в сеть, без кеша.
  // Это лечит ошибку "Partial response (status code 206) is unsupported".
  if (url.pathname.includes('/media/videos/') || url.pathname.includes('/media/audio/')) {
    return; // пусть браузер сам решает, ничего не перехватываем
  }

  // Картинки — сначала кеш
  if (url.pathname.includes('/media/images/')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Данные — сначала сеть
  if (url.pathname.includes('/data/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Всё остальное (html, js, css) — сначала сеть
  event.respondWith(networkFirstStrategy(request));
});

// ========== СТРАТЕГИИ КЕШИРОВАНИЯ ==========

function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then(function (response) {
          // Кешируем только полноценные ответы 200
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(function (cache) {
                return cache.put(request, cloned);
              })
              .catch(function () { /* игнорируем */ });
          }
          return response;
        })
        .catch(function () {
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#FFFCF5" width="100" height="100"/></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          throw new Error('Нет сети и нет кеша');
        });
    });
}

function networkFirstStrategy(request) {
  const timeout = 3000;

  return new Promise(function (resolve) {
    let networkFailed = false;

    const timer = setTimeout(function () {
      networkFailed = true;
      caches.match(request).then(function (cached) {
        if (cached) resolve(cached);
      });
    }, timeout);

    fetch(request)
      .then(function (response) {
        clearTimeout(timer);

        // Кешируем ТОЛЬКО полные успешные ответы (200), не 206 и не 304
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(function (cache) {
              return cache.put(request, cloned);
            })
            .catch(function () { /* игнорируем */ });
        }

        if (!networkFailed) resolve(response);
      })
      .catch(function () {
        clearTimeout(timer);
        return caches.match(request).then(function (cached) {
          if (cached) {
            resolve(cached);
          } else if (request.destination === 'document') {
            return caches.match('./index.html').then(function (homeCache) {
              resolve(homeCache || new Response('Нет соединения'));
            });
          }
        });
      });
  });
}

// ========== СООБЩЕНИЯ ==========
self.addEventListener('message', function (event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME);
    caches.delete(DYNAMIC_CACHE);
  }
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'sync-progress') {
    event.waitUntil(Promise.resolve());
  }
});