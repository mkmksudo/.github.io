document.addEventListener('DOMContentLoaded', () => {

    const ALL_TIMER_IDS = [1, 2, 3, 4, 6, 7];
    const timers = {
        // 機能1
        1: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        2: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        3: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        4: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        // 機能2, 3
        6: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null, adjustment: 0, adjustmentElement: null, config: { initialDuration: 110, cycleDuration: 15, beepBeforeEnd: 5 } },
        7: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null, adjustment: 0, adjustmentElement: null, config: { initialDuration: 110, cycleDuration: 12.6, beepBeforeEnd: 5 } }
    };

    // ===================================
    // ユーティリティ関数（Web Audio APIを使用）
    // ===================================
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let beepBuffer;

    // 警告音ファイルを読み込み、バッファとして保存する関数
    function loadBeepSound() {
        return fetch('beep.mp3')
            .then(response => {
                if (!response.ok) {
                    throw new Error('音声ファイルの読み込みに失敗しました。');
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedBuffer => {
                beepBuffer = decodedBuffer;
                console.log('警告音の読み込みに成功しました。');
            })
            .catch(e => console.error("音声ファイルの読み込みに失敗しました:", e));
    }

    // バッファから警告音を再生する関数
    function playBeep() {
        if (!beepBuffer) {
            console.error('警告音ファイルがまだロードされていません。');
            return;
        }

        const source = audioContext.createBufferSource();
        source.buffer = beepBuffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
    
    // タイマーのリセット処理をまとめた関数
    function resetTimer(timerId) {
        const timer = timers?.[timerId];
        if (!timer) return;

        timer.timeouts.forEach(clearTimeout);
        timer.intervals.forEach(clearInterval);
        if (timer.updateInterval) {
            clearInterval(timer.updateInterval);
        }

        timer.timeouts = [];
        timer.intervals = [];
        timer.startTime = null;
        timer.nextBeepTimes = [];
        timer.updateInterval = null;
        timer.adjustment = 0;

        if (timer.sectionElement) {
            timer.sectionElement.classList.remove('running');
        }
        if (timer.statusElement) {
            timer.statusElement.textContent = '';
        }
        updateNextBeepTime(timer.nextBeepElement, null, timerId);
        if (timer.adjustmentElement) {
            updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);
        }
        console.log(`機能${timerId}のタイマーがリセットされました。`);
    }

    // 全タイマーをリセットする関数
    function resetAllTimers() {
        ALL_TIMER_IDS.forEach(id => {
            resetTimer(id);
        });
        console.log('すべてのタイマーがリセットされました。');
    }

    function updateStatus(statusElement, message, color = '#3498db') {
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = color;
        }
    }

    function updateNextBeepTime(element, nextBeepTimestamp, timerId) {
        if (!element) return;

        const timer = timers?.[timerId];
        if (!timer || timer.startTime === null) {
            element.textContent = '待機中';
            if (timer.sectionElement) {
                timer.sectionElement.classList.remove('running');
            }
            return;
        }
        if (timer.sectionElement) {
            timer.sectionElement.classList.add('running');
        }

        const now = Date.now();
        let displayTime = '';
        
        if (timerId >= 1 && timerId <= 4) {
            const beep110Time = timer.startTime + (110 * 1000);
            const remainingMs = beep110Time - now;

            if (remainingMs <= 0) {
                displayTime = '00:00';
            } else {
                const totalSeconds = Math.ceil(remainingMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const formattedMinutes = String(minutes).padStart(2, '0');
                const formattedSeconds = String(seconds).padStart(2, '0');
                displayTime = `${formattedMinutes}:${formattedSeconds}`;
            }

        } else if (timerId === 6 || timerId === 7) {
            const initialDurationMs = timer.config.initialDuration * 1000;
            const cycleDurationMs = timer.config.cycleDuration * 1000;
            const elapsedMs = now - timer.startTime;
            
            let remainingMs;
            if (elapsedMs < initialDurationMs) {
                remainingMs = initialDurationMs - elapsedMs;
            } else {
                const elapsedSinceCycleStart = elapsedMs - initialDurationMs;
                remainingMs = cycleDurationMs - (elapsedSinceCycleStart % cycleDurationMs);
            }
            
            const totalSeconds = Math.ceil(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            displayTime = `${formattedMinutes}:${formattedSeconds}`;
        } else {
            displayTime = '';
        }
        
        element.textContent = displayTime;
    }


    function updateAdjustmentInfo(element, value) {
        if (element) {
            if (value === 0) {
                element.textContent = '';
            } else {
                element.textContent = `誤差調整: ${value.toFixed(1)}s`;
                element.style.color = (value > 0) ? '#dc3545' : '#28a745';
            }
        }
    }

    function startFixedTimer(timerId) {
        const timer = timers?.[timerId];
        if (!timer) return;

        resetTimer(timerId);

        timer.startTime = Date.now();
        updateStatus(timer.statusElement, 'タイマー開始', '#28a745');
        setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);

        const beep105TimeMs = 105 * 1000;
        const beep110TimeMs = 110 * 1000;

        timer.timeouts.push(setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '105秒経過！', '#ffc107');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 105秒後に音が鳴りました。`);
        }, beep105TimeMs));

        timer.timeouts.push(setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '110秒経過！完了。', '#28a745');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 110秒後に音が鳴りました。`);
            resetTimer(timerId);
        }, beep110TimeMs));

        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, null, timerId);
        }, 1000);
    }
    
    function startRepeatingTimer(timerId) {
        const timer = timers?.[timerId];
        if (!timer) return;

        if (timerId === 7) {
            resetTimer(6);
        } else if (timerId === 6) {
            resetTimer(7);
        }

        resetTimer(timerId);

        timer.startTime = Date.now();
        updateStatus(timer.statusElement, 'タイマー開始', '#28a745');
        setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
        
        scheduleRepeatingTimers(timerId);
    }

    function scheduleRepeatingTimers(timerId) {
        const timer = timers?.[timerId];
        if (!timer) return;

        const { initialDuration, cycleDuration, beepBeforeEnd } = timer.config;
        const initialDurationMs = initialDuration * 1000;
        const cycleDurationMs = cycleDuration * 1000;
        const beepBeforeEndMs = beepBeforeEnd * 1000;

        // 最初の110秒タイマーの警告音 (5秒前)
        const initialPreBeepTimeout = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '105秒経過！', '#ffc107');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 105秒後に音が鳴りました。`);
        }, initialDurationMs - beepBeforeEndMs);
        timer.timeouts.push(initialPreBeepTimeout);

        // 最初の110秒タイマーの警告音 (0秒)
        const initialBeepTimeout = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '110秒経過！', '#28a745');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 110秒後に音が鳴りました。`);

            // 最初のループの警告音 (5秒前)
            const firstLoopPreBeep = setTimeout(() => {
                playBeep();
                console.log(`機能${timerId}: ループ1週目終了5秒前に警告音が鳴りました。`);
            }, cycleDurationMs - beepBeforeEndMs);
            timer.timeouts.push(firstLoopPreBeep);

            // 最初のループの警告音 (0秒)
            const firstLoopBeep = setTimeout(() => {
                playBeep();
                updateStatus(timer.statusElement, 'ループ開始！', '#ffc107');
                setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
                console.log(`機能${timerId}: ループ1週目終了時に警告音が鳴りました。`);
                
                // 2周目以降のループタイマーを開始
                const loopInterval = setInterval(() => {
                    playBeep();
                    updateStatus(timer.statusElement, 'ループ開始！', '#ffc107');
                    setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
                    console.log(`機能${timerId}: ループ開始。`);
                    
                    const nextLoopPreBeep = setTimeout(() => {
                        playBeep();
                        console.log(`機能${timerId}: ループ終了5秒前に警告音が鳴りました。`);
                    }, cycleDurationMs - beepBeforeEndMs);
                    timer.timeouts.push(nextLoopPreBeep);
                }, cycleDurationMs);
                timer.intervals.push(loopInterval);
            }, cycleDurationMs);
            timer.timeouts.push(firstLoopBeep);

        }, initialDurationMs);
        timer.timeouts.push(initialBeepTimeout);


        if (timer.updateInterval) clearInterval(timer.updateInterval);
        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, null, timerId);
        }, 1000);
    }
    
    // 現在のカウントダウン時間から調整する関数
    function adjustTimer(timerId, amount) {
        const timer = timers?.[timerId];
        if (!timer || (timerId !== 6 && timerId !== 7) || timer.startTime === null) return;
        
        const now = Date.now();
        const elapsedSinceStart = now - timer.startTime;

        // タイマーのクリア
        timer.timeouts.forEach(clearTimeout);
        timer.intervals.forEach(clearInterval);
        timer.timeouts = [];
        timer.intervals = [];

        // 調整後のstartTimeを計算
        timer.startTime -= (amount * 1000);
        
        // 誤差表示を更新
        timer.adjustment = parseFloat((timer.adjustment + amount).toFixed(1));
        updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);

        // 新しいstartTimeでタイマーを再開
        scheduleRepeatingTimers(timerId);

        if (timer.updateInterval) {
            clearInterval(timer.updateInterval);
        }
        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, null, timerId);
        }, 1000);
    }
    
    // ===================================
    // DOM初期化
    // ===================================
    
    function initializeDOM() {
        // 最初のユーザー操作でAudioContextを有効化
        document.body.addEventListener('click', () => {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        }, { once: true });
        
        loadBeepSound();

        document.querySelectorAll('.all-reset-button').forEach(button => {
            button.addEventListener('click', resetAllTimers);
        });

        document.querySelectorAll('.timer-item').forEach(element => {
            const timerId = parseInt(element.dataset.timerId);
            const timer = timers?.[timerId];
            if (!timer) return;
            
            timer.sectionElement = element;
            timer.statusElement = element.querySelector('.current-status');
            timer.nextBeepElement = element.querySelector('.next-beep-time');
            timer.adjustmentElement = element.querySelector('.adjustment-info');

            const startButton = element.querySelector('.start-button');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    if (timerId >= 1 && timerId <= 4) {
                        startFixedTimer(timerId);
                    } else {
                        startRepeatingTimer(timerId);
                    }
                });
            }

            const resetButton = element.querySelector('.reset-button');
            if (resetButton) {
                resetButton.addEventListener('click', () => resetTimer(timerId));
            }

            const minusButton = element.querySelector('.adjust-button.minus');
            const plusButton = element.querySelector('.adjust-button.plus');
            
            // ボタンの表示と機能を入れ替える
            if (minusButton) {
                minusButton.addEventListener('click', () => adjustTimer(timerId, -1));
            }
            if (plusButton) {
                plusButton.addEventListener('click', () => adjustTimer(timerId, 1));
            }

            resetTimer(timerId);
        });
    }

    initializeDOM();
});
