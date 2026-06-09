// ========== CONFIG.JS ==========
// Загрузка и управление конфигурацией приложения

const GameConfig = (function() {
    'use strict';
    
    // Приватные переменные
    let _config = null;
    let _isLoaded = false;
    let _loadingPromise = null;
    
    // ========== ЗАГРУЗКА КОНФИГА ==========
    function load() {
        // Если уже загружается — вернуть существующий промис
        if (_loadingPromise) {
            return _loadingPromise;
        }
        
        // Если уже загружен — вернуть resolved
        if (_isLoaded && _config) {
            return Promise.resolve(_config);
        }
        
        _loadingPromise = fetch('data/scenes.json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Не удалось загрузить scenes.json: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                _config = data;
                _isLoaded = true;
                _loadingPromise = null;
                console.log('[Config] Конфигурация загружена. Сцен:', _config.scenes.length);
                return _config;
            })
            .catch(function(error) {
                _loadingPromise = null;
                console.error('[Config] Ошибка загрузки:', error);
                // Fallback — пустой конфиг, чтобы приложение не упало
                _config = createFallbackConfig();
                _isLoaded = true;
                return _config;
            });
        
        return _loadingPromise;
    }
    
    // ========== FALLBACK-КОНФИГ (если JSON не загрузился) ==========
    function createFallbackConfig() {
        console.warn('[Config] Используется fallback-конфигурация');
        return {
            app: {
                name: 'Суперколобок',
                totalScenes: 23,
                series: [
                    {
                        id: 'friendship',
                        name: 'Сила дружбы',
                        icon: '🌾',
                        type: 'h5p',
                        h5pPath: 'media/h5p/sila-druzhby.h5p',
                        order: 1
                    },
                    {
                        id: 'teamwork',
                        name: 'Сила команды',
                        icon: '⭐',
                        type: 'interactive',
                        order: 2
                    }
                ]
            },
            scenes: [],
            assets: {
                videos: {},
                audio: {},
                sfx: {},
                images: {}
            }
        };
    }
    
    // ========== ПОЛУЧЕНИЕ ДАННЫХ ==========
    function getAppConfig() {
        return _config ? _config.app : {};
    }
    
    function getTotalScenes() {
        return _config ? _config.app.totalScenes : 23;
    }
    
    function getScene(sceneId) {
        if (!_config || !_config.scenes) return null;
        return _config.scenes.find(function(s) { return s.id === sceneId; }) || null;
    }
    
    function getSceneByIndex(index) {
        if (!_config || !_config.scenes) return null;
        return _config.scenes[index] || null;
    }
    
    function getAllScenes() {
        return _config ? (_config.scenes || []) : [];
    }
    
    function getNextSceneId(currentSceneId) {
        var scene = getScene(currentSceneId);
        return scene ? scene.nextScene : null;
    }
    
    // ========== АССЕТЫ ==========
    function getVideo(key) {
        if (!_config || !_config.assets || !_config.assets.videos) return '';
        return _config.assets.videos[key] || '';
    }
    
    function getAudio(key) {
        if (!_config || !_config.assets || !_config.assets.audio) return '';
        return _config.assets.audio[key] || '';
    }
    
    function getSfx(key) {
        if (!_config || !_config.assets || !_config.assets.sfx) return '';
        return _config.assets.sfx[key] || '';
    }
    
    function getImage(key) {
        if (!_config || !_config.assets || !_config.assets.images) return '';
        return _config.assets.images[key] || '';
    }
    
    // ========== СЕРИИ ==========
    function getSeries() {
        if (!_config || !_config.app || !_config.app.series) return [];
        return _config.app.series;
    }
    
    function getSeriesById(seriesId) {
        var series = getSeries();
        return series.find(function(s) { return s.id === seriesId; }) || null;
    }
    
    // ========== ТЕКСТЫ С ПОДСТАНОВКОЙ ИМЕНИ ==========
    function formatText(text, childName) {
        if (!text) return '';
        return text.replace(/\{childName\}/g, childName || 'друг');
    }
    
    // ========== ПРОВЕРКИ ==========
    function isLoaded() {
        return _isLoaded;
    }
    
    function hasScene(sceneId) {
        return getScene(sceneId) !== null;
    }
    
    // ========== ПУБЛИЧНЫЙ API ==========
    return {
        // Загрузка
        load: load,
        isLoaded: isLoaded,
        
        // Конфиг
        getAppConfig: getAppConfig,
        getTotalScenes: getTotalScenes,
        
        // Сцены
        getScene: getScene,
        getSceneByIndex: getSceneByIndex,
        getAllScenes: getAllScenes,
        getNextSceneId: getNextSceneId,
        hasScene: hasScene,
        
        // Ассеты
        getVideo: getVideo,
        getAudio: getAudio,
        getSfx: getSfx,
        getImage: getImage,
        
        // Серии
        getSeries: getSeries,
        getSeriesById: getSeriesById,
        
        // Утилиты
        formatText: formatText
    };
})();