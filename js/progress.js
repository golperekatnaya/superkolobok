// ========== PROGRESS.JS ==========
// Управление прогресс-баром, звёздами и визуальным прогрессом

const Progress = (function() {
    'use strict';
    
    var _container = null;
    var _filledLine = null;
    var _kolobok = null;
    var _kolobokImg = null;
    
    var _currentStep = 0;
    var _totalSteps = 23;
    var _isInitialized = false;
    var _starElements = [];
    
    function init() {
        _container = document.getElementById('progressContainer');
        _filledLine = document.getElementById('progressLineFilled');
        _kolobok = document.getElementById('progressKolobok');
        _kolobokImg = document.getElementById('kolobokImg');
        
        if (!_container || !_filledLine || !_kolobok) {
            console.warn('[Progress] Не все элементы найдены');
            return false;
        }
        
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            _totalSteps = GameConfig.getTotalScenes();
        }
        
        updateKolobokImage();
        hide();
        
        _isInitialized = true;
        console.log('[Progress] OK. Шагов:', _totalSteps);
        
        window.addEventListener('resize', function() {
            if (_isInitialized && !_container.classList.contains('hidden')) {
                updatePosition();
            }
        });
        
        return true;
    }
    
    function update(step, total) {
        if (!_isInitialized) return;
        
        if (typeof total === 'number' && total > 0) {
            _totalSteps = total;
        }
        
        _currentStep = Math.max(0, Math.min(step, _totalSteps));
        
        if (_currentStep > 0) {
            show();
        } else {
            hide();
            return;
        }
        
        var percentage = (_currentStep / _totalSteps) * 100;
        _filledLine.style.width = percentage + '%';
        updatePosition();
        pulseKolobok();
    }
    
    function updatePosition() {
        if (!_isInitialized || _currentStep <= 0) return;
        
        var containerWidth = _container.offsetWidth;
        var kolobokWidth = _kolobok.offsetWidth;
        
        if (containerWidth <= 0 || kolobokWidth <= 0) return;
        
        var percentage = (_currentStep / _totalSteps) * 100;
        var maxLeft = containerWidth - kolobokWidth;
        var left = (percentage / 100) * maxLeft;
        left = Math.max(0, Math.min(left, maxLeft));
        
        _kolobok.style.left = left + 'px';
    }
    
    function updateKolobokImage() {
        if (!_kolobokImg) return;
        
        var imgSrc = '';
        if (typeof GameConfig !== 'undefined' && GameConfig.isLoaded()) {
            imgSrc = GameConfig.getImage('kolobokProgress');
        }
        if (!imgSrc) {
            imgSrc = 'media/images/kolobok-progress.png';
        }
        
        _kolobokImg.src = imgSrc;
        _kolobokImg.alt = 'Колобок';
        
        _kolobokImg.onerror = function() {
            _kolobok.style.display = 'none';
        };
        _kolobokImg.onload = function() {
            _kolobok.style.display = 'block';
            updatePosition();
        };
    }
    
    function show() {
        if (!_isInitialized) return;
        _container.classList.remove('hidden');
    }
    
    function hide() {
        if (!_isInitialized) return;
        _container.classList.add('hidden');
        _filledLine.style.width = '0%';
        _kolobok.style.left = '0px';
    }
    
    function isVisible() {
        if (!_isInitialized) return false;
        return !_container.classList.contains('hidden');
    }
    
    function pulseKolobok() {
        if (!_kolobok) return;
        _kolobok.style.transform = 'scale(1.2)';
        _kolobok.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        setTimeout(function() {
            _kolobok.style.transform = 'scale(1)';
        }, 300);
    }
    
    function initStars(starElements) {
        if (Array.isArray(starElements)) {
            _starElements = starElements;
        }
    }
    
    function updateStars(count) {
        if (typeof GameState !== 'undefined') {
            GameState.setStars(count);
        }
        
        _starElements.forEach(function(el, index) {
            if (index < count) {
                el.classList.add('earned');
                el.style.opacity = '1';
                el.style.transform = 'scale(1)';
                setTimeout(function() {
                    el.style.transform = 'scale(1.3)';
                    setTimeout(function() {
                        el.style.transform = 'scale(1)';
                    }, 200);
                }, index * 200);
            } else {
                el.classList.remove('earned');
                el.style.opacity = '0.3';
                el.style.transform = 'scale(0.8)';
            }
        });
    }
    
    function reset() {
        _currentStep = 0;
        if (_isInitialized) {
            _filledLine.style.width = '0%';
            _kolobok.style.left = '0px';
            hide();
        }
        if (_starElements.length > 0) {
            updateStars(0);
        }
    }
    
    function getCurrentStep() { return _currentStep; }
    function getTotalSteps() { return _totalSteps; }
    function getPercentage() {
        if (_totalSteps === 0) return 0;
        return Math.round((_currentStep / _totalSteps) * 100);
    }
    function isComplete() {
        return _currentStep >= _totalSteps && _totalSteps > 0;
    }
    
    return {
        init: init,
        isInitialized: function() { return _isInitialized; },
        update: update,
        updatePosition: updatePosition,
        show: show,
        hide: hide,
        isVisible: isVisible,
        initStars: initStars,
        updateStars: updateStars,
        reset: reset,
        getCurrentStep: getCurrentStep,
        getTotalSteps: getTotalSteps,
        getPercentage: getPercentage,
        isComplete: isComplete,
        pulseKolobok: pulseKolobok,
        updateKolobokImage: updateKolobokImage
    };
})();