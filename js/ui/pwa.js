// ========== PWA.JS ==========
// Управление PWA: установка, обновления, офлайн-режим

const PWA = (function() {
    'use strict';
    
    var _deferredPrompt = null;
    var _isInitialized = false;
    
    function init() {
        if (_isInitialized) return;
        
        // Кнопка установки
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            _deferredPrompt = e;
            showInstallButton();
        });
        
        window.addEventListener('appinstalled', function() {
            _deferredPrompt = null;
            hideInstallButton();
        });
        
        // Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(function(r) { console.log('[PWA] SW OK'); })
                .catch(function(e) { console.warn('[PWA] SW:', e); });
        }
        
        _isInitialized = true;
        console.log('[PWA] OK');
    }
    
    function showInstallButton() {
        var existing = document.getElementById('pwa-install-btn');
        if (existing) existing.remove();
        
        var btn = document.createElement('button');
        btn.id = 'pwa-install-btn';
        btn.textContent = 'Установить приложение';
        btn.style.cssText = 
            'display:block;position:fixed;bottom:20px;right:20px;z-index:9999;' +
            'background:#F5B342;color:white;border:none;padding:12px 24px;' +
            'border-radius:50px;font-size:0.9rem;font-weight:700;cursor:pointer;' +
            'box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        
        btn.addEventListener('click', function() {
            if (_deferredPrompt) {
                _deferredPrompt.prompt();
                _deferredPrompt.userChoice.then(function(r) {
                    console.log('[PWA]', r.outcome);
                });
                _deferredPrompt = null;
                btn.remove();
            }
        });
        
        document.body.appendChild(btn);
    }
    
    function hideInstallButton() {
        var btn = document.getElementById('pwa-install-btn');
        if (btn) btn.remove();
    }
    
    return { init: init };
})();

// Автозапуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { PWA.init(); });
} else {
    PWA.init();
}