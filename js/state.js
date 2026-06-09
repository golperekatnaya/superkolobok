// ========== STATE.JS ==========
// Управление состоянием игры

const GameState = (function() {
    'use strict';
    
    var _state = {
        childName: '',
        currentSceneId: 0,
        stars: 0,
        matchedPairs: {},
        currentSeries: null,
        history: [],
        maxHistoryLength: 50,
        completedSeries: {
            friendship: false,
            teamwork: false
        },
        settings: {
            soundEnabled: true,
            musicEnabled: true
        },
        sessionStartTime: null,
        stats: {
            totalGamesPlayed: 0,
            totalCorrectMatches: 0,
            totalWrongMatches: 0,
            totalTimeSpent: 0
        }
    };
    
    function init() {
        _state.sessionStartTime = Date.now();
        loadState();
        console.log('[State] Инициализировано. Имя:', _state.childName || '(не задано)');
    }
    
    function setChildName(name) {
        if (typeof name !== 'string') return false;
        var trimmed = name.trim();
        if (trimmed.length === 0) return false;
        if (trimmed.length > 12) trimmed = trimmed.substring(0, 12);
        _state.childName = trimmed;
        saveState();
        return true;
    }
    
    function getChildName() { return _state.childName || ''; }
    function hasChildName() { return _state.childName.length > 0; }
    
    function setCurrentScene(sceneId) {
        if (typeof sceneId !== 'number' || sceneId < 0) return false;
        _state.currentSceneId = sceneId;
        saveState();
        return true;
    }
    
    function getCurrentScene() { return _state.currentSceneId; }
    
    function pushHistory(sceneId) {
        _state.history.push({
            sceneId: sceneId,
            seriesId: _state.currentSeries,
            timestamp: Date.now()
        });
        if (_state.history.length > _state.maxHistoryLength) _state.history.shift();
        _state.currentSceneId = sceneId;
        saveState();
    }
    
    function popHistory() {
        if (_state.history.length <= 1) return null;
        _state.history.pop();
        var prev = _state.history[_state.history.length - 1];
        if (prev) {
            _state.currentSceneId = prev.sceneId;
            _state.currentSeries = prev.seriesId;
            saveState();
            return prev;
        }
        return null;
    }
    
    function canGoBack() { return _state.history.length > 1; }
    function getHistoryLength() { return _state.history.length; }
    
    function setStars(count) {
        if (typeof count !== 'number') return false;
        _state.stars = Math.max(0, Math.min(3, count));
        saveState();
        return true;
    }
    
    function getStars() { return _state.stars; }
    function addStar() { return setStars(_state.stars + 1); }
    function resetStars() { _state.stars = 0; saveState(); }
    
    function setMatchedPair(charId, itemId) { _state.matchedPairs[charId] = itemId; }
    function getMatchedPairs() { return Object.assign({}, _state.matchedPairs); }
    function getMatchedCount() { return Object.keys(_state.matchedPairs).length; }
    function clearMatchedPairs() { _state.matchedPairs = {}; }
    function isPairMatched(charId) { return _state.matchedPairs.hasOwnProperty(charId); }
    
    function setCurrentSeries(seriesId) {
        if (!seriesId) { _state.currentSeries = null; return true; }
        var valid = ['friendship', 'teamwork'];
        if (valid.indexOf(seriesId) === -1) return false;
        _state.currentSeries = seriesId;
        saveState();
        return true;
    }
    
    function getCurrentSeries() { return _state.currentSeries; }
    
    function completeSeries(seriesId) {
        if (_state.completedSeries.hasOwnProperty(seriesId)) {
            _state.completedSeries[seriesId] = true;
            saveState();
            return true;
        }
        return false;
    }
    
    function isSeriesCompleted(seriesId) { return _state.completedSeries[seriesId] || false; }
    
    function setSetting(key, value) {
        if (_state.settings.hasOwnProperty(key)) { _state.settings[key] = Boolean(value); saveState(); return true; }
        return false;
    }
    
    function getSetting(key) { return _state.settings[key]; }
    function isSoundEnabled() { return _state.settings.soundEnabled; }
    function isMusicEnabled() { return _state.settings.musicEnabled; }
    
    function recordGamePlayed() { _state.stats.totalGamesPlayed++; saveState(); }
    function recordMatch(isCorrect) {
        if (isCorrect) _state.stats.totalCorrectMatches++;
        else _state.stats.totalWrongMatches++;
        saveState();
    }
    
    function getStats() {
        var s = Object.assign({}, _state.stats);
        if (_state.sessionStartTime) s.currentSessionTime = Math.floor((Date.now() - _state.sessionStartTime) / 1000);
        return s;
    }
    
    function getAccuracy() {
        var t = _state.stats.totalCorrectMatches + _state.stats.totalWrongMatches;
        return t === 0 ? 0 : Math.round((_state.stats.totalCorrectMatches / t) * 100);
    }
    
    function resetAll() {
        var oldName = _state.childName;
        _state = {
            childName: oldName,
            currentSceneId: 0,
            stars: 0,
            matchedPairs: {},
            currentSeries: null,
            history: [],
            maxHistoryLength: 50,
            completedSeries: _state.completedSeries,
            settings: _state.settings,
            sessionStartTime: Date.now(),
            stats: _state.stats
        };
        saveState();
    }
    
    function resetProgress() {
        _state.childName = '';
        _state.currentSceneId = 0;
        _state.stars = 0;
        _state.matchedPairs = {};
        _state.history = [];
        _state.currentSeries = null;
        _state.sessionStartTime = Date.now();
        saveState();
        console.log('[State] Прогресс сброшен (включая имя)');
    }
    
    // ========== НОВЫЕ МЕТОДЫ ДЛЯ РЕЖИМА ИГРЫ ==========
    function setGameMode(mode) {
        if (mode === 'solo' || mode === 'adult') {
            localStorage.setItem('gameMode', mode);
            console.log('[State] Режим игры установлен:', mode);
            return true;
        }
        return false;
    }
    
    function getGameMode() {
        var mode = localStorage.getItem('gameMode');
        return (mode === 'solo' || mode === 'adult') ? mode : null;
    }
    
    function clearGameMode() {
        localStorage.removeItem('gameMode');
        console.log('[State] Режим игры сброшен');
    }
    
    function saveState() {
        try {
            var toSave = {
                childName: _state.childName,
                stars: _state.stars,
                completedSeries: _state.completedSeries,
                settings: _state.settings,
                stats: _state.stats,
                currentSceneId: _state.currentSceneId,
                currentSeries: _state.currentSeries,
                gameMode: getGameMode(), // Сохраняем режим
                lastSaved: Date.now()
            };
            localStorage.setItem('superkolobok-state', JSON.stringify(toSave));
        } catch(e) {}
    }
    
    function loadState() {
        try {
            var saved = localStorage.getItem('superkolobok-state');
            if (saved) {
                var data = JSON.parse(saved);
                if (data.childName) _state.childName = data.childName;
                if (typeof data.stars === 'number') _state.stars = data.stars;
                if (data.completedSeries) _state.completedSeries = data.completedSeries;
                if (data.settings) {
                    _state.settings.soundEnabled = data.settings.soundEnabled !== false;
                    _state.settings.musicEnabled = data.settings.musicEnabled !== false;
                }
                if (data.stats) {
                    _state.stats.totalGamesPlayed = data.stats.totalGamesPlayed || 0;
                    _state.stats.totalCorrectMatches = data.stats.totalCorrectMatches || 0;
                    _state.stats.totalWrongMatches = data.stats.totalWrongMatches || 0;
                }
                if (typeof data.currentSceneId === 'number') _state.currentSceneId = data.currentSceneId;
                if (data.currentSeries) _state.currentSeries = data.currentSeries;
                // Восстанавливаем режим игры, если он был сохранён
                if (data.gameMode) {
                    setGameMode(data.gameMode);
                }
                return true;
            }
        } catch(e) {}
        return false;
    }
    
    function clearSavedState() {
        try { 
            localStorage.removeItem('superkolobok-state');
            localStorage.removeItem('gameMode');
            return true;
        }
        catch(e) { return false; }
    }
    
    return {
        init: init,
        setChildName: setChildName,
        getChildName: getChildName,
        hasChildName: hasChildName,
        setCurrentScene: setCurrentScene,
        getCurrentScene: getCurrentScene,
        pushHistory: pushHistory,
        popHistory: popHistory,
        canGoBack: canGoBack,
        getHistoryLength: getHistoryLength,
        setStars: setStars,
        getStars: getStars,
        addStar: addStar,
        resetStars: resetStars,
        setMatchedPair: setMatchedPair,
        getMatchedPairs: getMatchedPairs,
        getMatchedCount: getMatchedCount,
        clearMatchedPairs: clearMatchedPairs,
        isPairMatched: isPairMatched,
        setCurrentSeries: setCurrentSeries,
        getCurrentSeries: getCurrentSeries,
        completeSeries: completeSeries,
        isSeriesCompleted: isSeriesCompleted,
        setSetting: setSetting,
        getSetting: getSetting,
        isSoundEnabled: isSoundEnabled,
        isMusicEnabled: isMusicEnabled,
        recordGamePlayed: recordGamePlayed,
        recordMatch: recordMatch,
        getStats: getStats,
        getAccuracy: getAccuracy,
        resetAll: resetAll,
        resetProgress: resetProgress,
        // НОВЫЕ МЕТОДЫ
        setGameMode: setGameMode,
        getGameMode: getGameMode,
        clearGameMode: clearGameMode,
        saveState: saveState,
        loadState: loadState,
        clearSavedState: clearSavedState
    };
})();