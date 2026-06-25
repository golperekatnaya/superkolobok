// ========== Service Worker "Суперколобок" ==========

const CACHE_NAME = 'superkolobok-v1.2.0';  // ← ОБНОВИ ВЕРСИЮ!
const DYNAMIC_CACHE = 'superkolobok-dynamic-v1';

// Файлы, которые кешируются сразу при установке
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/state.js',
  '/js/progress.js',
  '/js/audio.js',
  '/js/navigation.js',
  '/js/ui/components.js',
  '/js/ui/popup.js',
  '/js/ui/pwa.js',
  '/js/scenes/name-screen.js',
  '/js/scenes/series-select.js',
  '/js/scenes/video-scene.js',
  '/js/scenes/hint-screen.js',
  '/js/scenes/game1.js',
  '/js/scenes/game2.js',
  '/js/scenes/game3.js',
  '/js/scenes/test.js',
  '/js/scenes/finale.js',
  '/data/scenes.json',
  '/media/images/web-app-manifest-192x192.png',
  '/media/images/web-app-manifest-512x512.png',
  '/media/images/favicon.svg',
  '/media/images/favicon-96x96.png',
  '/media/images/favicon.ico',
  '/media/images/apple-touch-icon.png',
  '/media/images/firefly.png',
  '/media/images/kolobok.svg',
  '/media/images/play-btn.svg',
  '/media/images/kolobok-progress.png',
  '/media/images/key-icon.png'
];

// ========== УСТАНОВКА ==========
self.addEventListener('install', function(event) {
  console.log('[SW] Установка...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Кеширование статических файлов...');
        return Promise.allSettled(
          STATIC_ASSETS.map(function(url) {
            return cache.add(url).catch(function(err) {
              console.warn('[SW] Не удалось закешировать:', url, err);
            });
          })
        );
      })
      .then(function() {
        console.log('[SW] Статические файлы закешированы');
        return self.skipWaiting();
      })
  );
});

// ========== АКТИВАЦИЯ ==========
self.addEventListener('activate', function(event) {
  console.log('[SW] Активация...');
  
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.map(function(key) {
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
              console.log('[SW] Удаление старого кеша:', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(function() {
        console.log('[SW] Активирован');
        return self.clients.claim();
      })
  );
});

// ========== ПЕРЕХВАТ ЗАПРОСОВ ==========
self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  if (!url.origin.includes(self.location.origin)) {
    return;
  }
  
  if (url.pathname.includes('/media/videos/') || url.pathname.includes('/media/audio/')) {
    event.respondWith(mediaStrategy(request));
    return;
  }
  
  if (url.pathname.includes('/media/images/')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  if (url.pathname.includes('/data/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  event.respondWith(networkFirstStrategy(request));
});

// ========== СТРАТЕГИИ КЕШИРОВАНИЯ ==========

function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(function(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request)
        .then(function(response) {
          return caches.open(DYNAMIC_CACHE)
            .then(function(cache) {
              cache.put(request, response.clone());
              return response;
            });
        })
        .catch(function() {
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
  
  return new Promise(function(resolve) {
    let networkFailed = false;
    
    const timer = setTimeout(function() {
      networkFailed = true;
      caches.match(request).then(function(cached) {
        if (cached) resolve(cached);
      });
    }, timeout);
    
    fetch(request)
      .then(function(response) {
        clearTimeout(timer);
        
        if (response.ok) {
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE).then(function(cache) {
            cache.put(request, cloned);
          });
        }
        
        if (!networkFailed) resolve(response);
      })
      .catch(function() {
        clearTimeout(timer);
        return caches.match(request).then(function(cached) {
          if (cached) {
            resolve(cached);
          } else if (request.destination === 'document') {
            return caches.match('/index.html').then(function(homeCache) {
              resolve(homeCache || new Response('Нет соединения'));
            });
          }
        });
      });
  });
}

function mediaStrategy(request) {
  return fetch(request)
    .then(function(response) {
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) < 5 * 1024 * 1024) {
        const cloned = response.clone();
        caches.open(DYNAMIC_CACHE).then(function(cache) {
          cache.put(request, cloned);
        });
      }
      return response;
    })
    .catch(function() {
      return caches.match(request);
    });
}

// ========== СООБЩЕНИЯ ==========
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME);
    caches.delete(DYNAMIC_CACHE);
  }
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-progress') {
    event.waitUntil(Promise.resolve());
  }
});