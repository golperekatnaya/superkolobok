// ========== AUDIO.JS ==========
// Управление звуками, озвучкой и фоновой музыкой

const AudioManager = (function() {
    'use strict';
    
    var _currentAudio = null;
    var _isPlaying = false;
    var _isInitialized = false;
    
    var _audioQueue = [];
    var _isQueuePlaying = false;
    
    var _sfxVolume = 1.0;
    var _voiceVolume = 1.0;
    var _musicVolume = 0.5;
    
    var _sfxCache = {};
    
    var _lastCorrectIndex = -1;
    var _lastWrongIndex = -1;
    
    var _musicAudio = null;
    var _isMusicPlaying = false;
    
    function init() {
        if (_isInitialized) return true;
        
        if (typeof GameState !== 'undefined') {
            if (!GameState.isSoundEnabled()) {
                _sfxVolume = 0;
                _voiceVolume = 0;
            }
            if (!GameState.isMusicEnabled()) {
                _musicVolume = 0;
            }
        }
        
        _isInitialized = true;
        console.log('[Audio] OK');
        
        // Восстанавливаем состояние иконки звука
        var isMuted = (_sfxVolume <= 0 && _voiceVolume <= 0);
        updateSoundIcon(!isMuted);
        
        return true;
    }
    
    function playSfx(key) {
        if (!_isInitialized) init();
        if (_sfxVolume <= 0) return;
        
        var src = getSfxSource(key);
        if (!src) {
            console.warn('[Audio] SFX не найден:', key);
            return;
        }
        
        if (_sfxCache[key]) {
            var cached = _sfxCache[key];
            cached.currentTime = 0;
            cached.volume = _sfxVolume;
            cached.play().catch(function(e) {
                console.warn('[Audio] Ошибка SFX:', key, e.message);
            });
            return;
        }
        
        var audio = new Audio(src);
        audio.volume = _sfxVolume;
        audio.preload = 'auto';
        _sfxCache[key] = audio;
        
        audio.play().catch(function(e) {
            console.warn('[Audio] Ошибка SFX:', key, e.message);
        });
    }
    
    function getSfxSource(key) {
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            var path = GameConfig.getSfx(key);
            if (path) return path;
        }
        
        var fallbackSfx = {
            'cubeClick': 'media/audio/click.mp3',
            'cubeClear': 'media/audio/clear.mp3',
            'cubeConfirm': 'media/audio/confirm.mp3',
            'fireflyAppear': 'media/audio/firefly-appear.mp3',
            'correct1': 'media/audio/correct1.m4a',
            'correct2': 'media/audio/correct2.m4a',
            'correct3': 'media/audio/correct3.m4a',
            'wrong1': 'media/audio/wrong1.m4a',
            'wrong2': 'media/audio/wrong2.m4a',
            'wrong3': 'media/audio/wrong3.m4a',
            'letter-a': 'media/audio/letters/letter-a.m4a',
            'letter-be': 'media/audio/letters/letter-be.m4a',
            'letter-ve': 'media/audio/letters/letter-ve.m4a',
            'letter-ge': 'media/audio/letters/letter-ge.m4a',
            'letter-de': 'media/audio/letters/letter-de.m4a',
            'letter-ye': 'media/audio/letters/letter-ye.m4a',
            'letter-yo': 'media/audio/letters/letter-yo.m4a',
            'letter-zhe': 'media/audio/letters/letter-zhe.m4a',
            'letter-ze': 'media/audio/letters/letter-ze.m4a',
            'letter-i': 'media/audio/letters/letter-i.m4a',
            'letter-i-kratkoe': 'media/audio/letters/letter-i-kratkoe.m4a',
            'letter-ka': 'media/audio/letters/letter-ka.m4a',
            'letter-el': 'media/audio/letters/letter-el.m4a',
            'letter-em': 'media/audio/letters/letter-em.m4a',
            'letter-en': 'media/audio/letters/letter-en.m4a',
            'letter-o': 'media/audio/letters/letter-o.m4a',
            'letter-pe': 'media/audio/letters/letter-pe.m4a',
            'letter-er': 'media/audio/letters/letter-er.m4a',
            'letter-es': 'media/audio/letters/letter-es.m4a',
            'letter-te': 'media/audio/letters/letter-te.m4a',
            'letter-u': 'media/audio/letters/letter-u.m4a',
            'letter-ef': 'media/audio/letters/letter-ef.m4a',
            'letter-ha': 'media/audio/letters/letter-ha.m4a',
            'letter-tse': 'media/audio/letters/letter-tse.m4a',
            'letter-che': 'media/audio/letters/letter-che.m4a',
            'letter-sha': 'media/audio/letters/letter-sha.m4a',
            'letter-scha': 'media/audio/letters/letter-scha.m4a',
            'letter-tvyordiy-znak': 'media/audio/letters/letter-tvyordiy-znak.m4a',
            'letter-yery': 'media/audio/letters/letter-yery.m4a',
            'letter-myagkiy-znak': 'media/audio/letters/letter-myagkiy-znak.m4a',
            'letter-e': 'media/audio/letters/letter-e.m4a',
            'letter-yu': 'media/audio/letters/letter-yu.m4a',
            'letter-ya': 'media/audio/letters/letter-ya.m4a'
        };
        
        return fallbackSfx[key] || '';
    }
    
    function playRandomCorrect() {
        var pool = ['correct1', 'correct2', 'correct3'];
        var index;
        do {
            index = Math.floor(Math.random() * pool.length);
        } while (index === _lastCorrectIndex && pool.length > 1);
        _lastCorrectIndex = index;
        playSfx(pool[index]);
    }
    
    function playRandomWrong() {
        var pool = ['wrong1', 'wrong2', 'wrong3'];
        var index;
        do {
            index = Math.floor(Math.random() * pool.length);
        } while (index === _lastWrongIndex && pool.length > 1);
        _lastWrongIndex = index;
        playSfx(pool[index]);
    }
    
    function playVoice(key, callback) {
        if (!_isInitialized) init();
        
        if (!key) {
            if (callback) callback();
            return;
        }
        
        var src = getVoiceSource(key);
        if (!src) {
            console.warn('[Audio] Озвучка не найдена:', key);
            if (callback) callback();
            return;
        }
        
        stopVoice();
        
        var audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = _voiceVolume;
        _currentAudio = audio;
        _isPlaying = true;
        
        audio.onended = function() {
            _currentAudio = null;
            _isPlaying = false;
            if (callback) callback();
        };
        
        audio.onerror = function() {
            console.warn('[Audio] Ошибка загрузки:', key);
            _currentAudio = null;
            _isPlaying = false;
            if (callback) callback();
        };
        
        audio.play().catch(function(e) {
            console.warn('[Audio] Ошибка воспроизведения:', key, e.message);
            _currentAudio = null;
            _isPlaying = false;
            if (callback) callback();
        });
    }
    
    function getVoiceSource(key) {
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            var path = GameConfig.getAudio(key);
            if (path) return path;
        }
        
        var fallbackAudio = {
            'nameGreeting': 'media/audio/name-greeting.m4a',
            'seriesSelect': 'media/audio/series-select.m4a',
            'game1Intro': 'media/audio/game1-intro.m4a',
            'game1Popup': 'media/audio/game1-popup.m4a',
            'game2Intro': 'media/audio/game2-intro.m4a',
            'game2Popup': 'media/audio/game2-popup.m4a',
            'game2Result': 'media/audio/game2-result.m4a',
            'testQuestion': 'media/audio/testQuestion.m4a',
            'testOption1': 'media/audio/testOption1.wav',
            'testOption2': 'media/audio/testOption2.wav',
            'testOption3': 'media/audio/testOption3.wav',
            'fireflyDinnerSpeech': 'media/audio/firefly-dinner-speech.m4a',
            'game3Popup': 'media/audio/game3-popup.m4a'
        };
        
        return fallbackAudio[key] || '';
    }
    
    function stopVoice() {
        if (_currentAudio) {
            _currentAudio.pause();
            _currentAudio.onended = null;
            _currentAudio.onerror = null;
            _currentAudio = null;
        }
        _isPlaying = false;
    }
    
    function isVoicePlaying() { return _isPlaying; }
    
    function playVoiceQueue(keys, callback) {
        if (!keys || keys.length === 0) { if (callback) callback(); return; }
        _audioQueue = keys.slice();
        _isQueuePlaying = true;
        processVoiceQueue(callback);
    }
    
    function processVoiceQueue(finalCallback) {
        if (_audioQueue.length === 0) { _isQueuePlaying = false; if (finalCallback) finalCallback(); return; }
        var nextKey = _audioQueue.shift();
        playVoice(nextKey, function() { setTimeout(function() { processVoiceQueue(finalCallback); }, 300); });
    }
    
    function stopVoiceQueue() { _audioQueue = []; _isQueuePlaying = false; stopVoice(); }
    
    function playMusic(src, loop) {
        if (!_isInitialized) init();
        if (_musicVolume <= 0) return;
        stopMusic();
        if (!src) return;
        _musicAudio = new Audio(src);
        _musicAudio.volume = _musicVolume;
        _musicAudio.loop = loop !== false;
        _musicAudio.preload = 'auto';
        _musicAudio.play().catch(function(e) { console.warn('[Audio] Ошибка музыки:', e.message); });
        _isMusicPlaying = true;
    }
    
    function stopMusic() {
        if (_musicAudio) { _musicAudio.pause(); _musicAudio.src = ''; _musicAudio = null; }
        _isMusicPlaying = false;
    }
    
    function pauseMusic() { if (_musicAudio && _isMusicPlaying) { _musicAudio.pause(); _isMusicPlaying = false; } }
    function resumeMusic() { if (_musicAudio && !_isMusicPlaying && _musicVolume > 0) { _musicAudio.play().catch(function() {}); _isMusicPlaying = true; } }
    
    function setSfxVolume(volume) {
        _sfxVolume = Math.max(0, Math.min(1, volume));
        Object.values(_sfxCache).forEach(function(a) { a.volume = _sfxVolume; });
    }
    
    function setVoiceVolume(volume) { _voiceVolume = Math.max(0, Math.min(1, volume)); if (_currentAudio) _currentAudio.volume = _voiceVolume; }
    function setMusicVolume(volume) { _musicVolume = Math.max(0, Math.min(1, volume)); if (_musicAudio) _musicAudio.volume = _musicVolume; }
    
    function muteAll() {
        setSfxVolume(0); setVoiceVolume(0); setMusicVolume(0);
        if (typeof GameState !== 'undefined') { GameState.setSetting('soundEnabled', false); GameState.setSetting('musicEnabled', false); }
        updateSoundIcon(false);
    }
    
    function unmuteAll() {
        setSfxVolume(1); setVoiceVolume(1); setMusicVolume(0.5);
        if (typeof GameState !== 'undefined') { GameState.setSetting('soundEnabled', true); GameState.setSetting('musicEnabled', true); }
        updateSoundIcon(true);
    }
    
    function toggleMute() {
        var isMuted = (_sfxVolume <= 0 && _voiceVolume <= 0);
        
        if (isMuted) {
            unmuteAll();
            return false; // звук включён
        } else {
            muteAll();
            return true; // звук выключен
        }
    }
    
    function updateSoundIcon(isOn) {
        var icon = document.getElementById('soundIcon');
        if (!icon) return;
        
        if (isOn) {
            // Звук включён — динамик
            icon.innerHTML = 
                '<path d="M6 12V20H10L18 28V4L10 12H6Z" fill="#B87A3A"/>' +
                '<path d="M22 10C24 12 24 20 22 22" stroke="#B87A3A" stroke-width="2" stroke-linecap="round"/>' +
                '<path d="M26 6C30 10 30 22 26 26" stroke="#B87A3A" stroke-width="2" stroke-linecap="round"/>';
            icon.style.opacity = '1';
        } else {
            // Звук выключен — динамик с крестиком
            icon.innerHTML = 
                '<path d="M6 12V20H10L18 28V4L10 12H6Z" fill="#B87A3A" opacity="0.4"/>' +
                '<line x1="4" y1="4" x2="28" y2="28" stroke="#B87A3A" stroke-width="3" stroke-linecap="round"/>' +
                '<path d="M22 10C24 12 24 20 22 22" stroke="#B87A3A" stroke-width="2" stroke-linecap="round" opacity="0.4"/>' +
                '<path d="M26 6C30 10 30 22 26 26" stroke="#B87A3A" stroke-width="2" stroke-linecap="round" opacity="0.4"/>';
            icon.style.opacity = '0.5';
        }
    }
    
    function isPlaying() { return _isPlaying || _isQueuePlaying || _isMusicPlaying; }
    function isMuted() { return _sfxVolume <= 0 && _voiceVolume <= 0; }
    
    function stopAll() { stopVoice(); stopVoiceQueue(); stopMusic(); _isPlaying = false; _isQueuePlaying = false; _isMusicPlaying = false; }
    
    function clearCache() {
        Object.values(_sfxCache).forEach(function(a) { a.pause(); a.src = ''; });
        _sfxCache = {};
    }
    
    return {
        init: init,
        playSfx: playSfx,
        playRandomCorrect: playRandomCorrect,
        playRandomWrong: playRandomWrong,
        playVoice: playVoice,
        stopVoice: stopVoice,
        isVoicePlaying: isVoicePlaying,
        playVoiceQueue: playVoiceQueue,
        stopVoiceQueue: stopVoiceQueue,
        playMusic: playMusic,
        stopMusic: stopMusic,
        pauseMusic: pauseMusic,
        resumeMusic: resumeMusic,
        setSfxVolume: setSfxVolume,
        setVoiceVolume: setVoiceVolume,
        setMusicVolume: setMusicVolume,
        muteAll: muteAll,
        unmuteAll: unmuteAll,
        toggleMute: toggleMute,
        updateSoundIcon: updateSoundIcon,
        isPlaying: isPlaying,
        isMuted: isMuted,
        stopAll: stopAll,
        clearCache: clearCache
    };
})();