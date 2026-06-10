// ========== APP.JS ==========
// Точка входа в приложение

const App = (function() {
    'use strict';
    
    var _isInitialized = false;
    var _isLoading = false;
    
    function init() {
        if (_isInitialized) return;
        if (_isLoading) return;
        
        _isLoading = true;
        console.log('[App] Запуск...');
        
        GameConfig.load()
            .then(function() {
                console.log('[App] Конфиг загружен');
                
                GameState.init();
                
                // Всегда сбрасываем прогресс при новом запуске
                GameState.resetProgress();
                
                Progress.init();
                Navigation.init();
                AudioManager.init();
                
                setupPWA();
                
                _isInitialized = true;
                _isLoading = false;
                
                console.log('[App] -> Экран имени');
                
                // Прямой вызов экрана имени (без выбора режима)
                Navigation.goTo(NameScreen.render, 0);
            })
            .catch(function(error) {
                console.error('[App] Ошибка:', error);
                _isLoading = false;
                showErrorScreen(error);
            });
    }
    
    function showErrorScreen(error) {
        var c = document.getElementById('sceneContent');
        if (!c) return;
        c.innerHTML = 
            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;padding:40px;text-align:center;background:#FFFCF5;">' +
                '<h2 style="color:#C68B3C;margin-bottom:12px;">Что-то пошло не так</h2>' +
                '<p style="color:#8B7355;margin:12px 0;font-size:0.85rem;">' + (error ? error.message : 'Неизвестная ошибка') + '</p>' +
                '<button onclick="location.reload()" style="background:#F5B342;color:white;border:none;padding:12px 24px;border-radius:50px;font-size:1rem;font-weight:700;cursor:pointer;">Обновить</button>' +
            '</div>';
    }
    
    function setupPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(function(r) { console.log('[App] SW OK'); })
                .catch(function(e) { console.warn('[App] SW:', e); });
        }
    }
    
    return {
        init: init,
        isInitialized: function() { return _isInitialized; }
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    App.init();
});