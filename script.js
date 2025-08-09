document.addEventListener('DOMContentLoaded', () => {

    const ALL_TIMER_IDS = [1, 2, 3, 4, 6, 7];
    const timers = {
        // 機能1
        1: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        2: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        3: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        4: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null },
        // 機能2, 3
        6: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null, adjustment: 0, adjustmentElement: null, config: { cycleDuration: 15, beep1Offset: 10, beep2Offset: 15 } },
        7: { timeouts: [], intervals: [], startTime: null, nextBeepTimes: [], updateInterval: null, statusElement: null, nextBeepElement: null, sectionElement: null, adjustment: 0, adjustmentElement: null, config: { cycleDuration: 12.6, beep1Offset: 7.6, beep2Offset: 12.6 } }
    };
    
    // ===================================
    // ユーティリティ関数
    // ===================================

    // MP3ファイルの警告音を再生する関数
    function playBeep() {
        try {
            const audio = new Audio('beep.mp3');
            audio.play().catch(e => console.error("音声の再生に失敗しました:", e));
        } catch (e) {
            console.error("音声の再生に失敗しました:", e);
        }
    }

    // タイマーのリセット処理をまとめた関数
    function resetTimer(timerId) {
        const timer = timers[timerId];
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

        updateStatus(timer.statusElement, '待機中', '#7f8c8d');
        updateNextBeepTime(timer.nextBeepElement, '', timerId);
        if (timer.adjustmentElement) {
            updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);
        }
        console.log(`機能${timerId}のタイマーがリセットされました。`);
    }

    // 全タイマーをリセットする関数
    function resetAllTimers() {
        ALL_TIMER_IDS.forEach(id => {
            const timer = timers[id];
            if (id !== 6 && id !== 7) {
                 resetTimer(id);
            } else {
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
                 updateStatus(timer.statusElement, '待機中', '#7f8c8d');
                 updateNextBeepTime(timer.nextBeepElement, '', id);
                 updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);
            }
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

        if (nextBeepTimestamp === '') {
            element.textContent = '';
            return;
        }

        const now = Date.now();
        let displayTime = '';
        let targetBeepTime = null;

        const allFutureBeeps = timers[timerId].nextBeepTimes.filter(t => t > now).sort((a,b) => a - b);
        if (allFutureBeeps.length > 0) {
            targetBeepTime = allFutureBeeps[0];
        }

        if (targetBeepTime) {
            const remainingMs = targetBeepTime - now;
            const totalSeconds = Math.ceil(remainingMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            displayTime = `${formattedMinutes}:${formattedSeconds}`;

            if (remainingMs <= 0) {
                displayTime = '00:00';
                element.style.color = '#000000';
            } else {
                element.style.color = '#000000';
            }
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
                element.style.color = (value > 0) ? '#e74c3c' : '#2ecc71';
            }
        }
    }

    function adjustTimer(timerId, amount) {
        const timer = timers[timerId];
        if (!timer || (timerId !== 6 && timerId !== 7) || timer.startTime === null) return;

        timer.adjustment = parseFloat((timer.adjustment + amount).toFixed(1));
        updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);
        console.log(`機能${timerId}の誤差調整: ${timer.adjustment.toFixed(1)}s`);

        timer.timeouts.forEach(clearTimeout);
        timer.intervals.forEach(clearInterval);
        timer.timeouts = [];
        timer.intervals = [];

        const elapsedSinceOriginalStart = Date.now() - timer.startTime;
        
        // 経過時間も調整値を考慮して計算
        const adjustedStartTime = timer.startTime + (timer.adjustment * 1000);
        const elapsedSinceAdjustedStart = Date.now() - adjustedStartTime;

        if (elapsedSinceAdjustedStart < (110 * 1000)) {
            scheduleInitialBeeps(timerId);
        } else {
            scheduleRepeatingBeeps(timerId, elapsedSinceAdjustedStart);
        }

        // 誤差調整後に表示を即時更新
        if (timer.updateInterval) {
            clearInterval(timer.updateInterval);
        }
        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, '', timerId);
        }, 1000);
    }
    
    // ===================================
    // タイマー開始・停止ロジック
    // ===================================

    function scheduleInitialBeeps(timerId) {
        const timer = timers[timerId];
        const now = Date.now();

        const initialBeep105Time = timer.startTime + (105 * 1000) + (timer.adjustment * 1000);
        const initialBeep110Time = timer.startTime + (110 * 1000) + (timer.adjustment * 1000);
        timer.nextBeepTimes = [initialBeep105Time, initialBeep110Time].sort((a, b) => a - b);

        const initialTimeout1 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '105秒経過！', '#3498db');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 105秒後に音が鳴りました。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
        }, initialBeep105Time - now);

        const initialTimeout2 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '110秒経過！繰り返し開始。', '#3498db');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 110秒後に音が鳴りました。初回完了。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());

            scheduleCycleBeeps(timerId);

            const intervalId = setInterval(() => {
                scheduleCycleBeeps(timerId);
            }, (timer.config.cycleDuration * 1000) + (timer.adjustment * 1000));
            timer.intervals.push(intervalId);

        }, initialBeep110Time - now);

        timer.timeouts.push(initialTimeout1, initialTimeout2);
    }

    function scheduleRepeatingBeeps(timerId, elapsedSinceAdjustedStart) {
        const timer = timers[timerId];
        const { cycleDuration, beep1Offset, beep2Offset } = timer.config;

        const adjustedCycleDurationMs = (cycleDuration * 1000) + (timer.adjustment * 1000);
        const currentCycleElapsed = (elapsedSinceAdjustedStart - ((110 * 1000))) % adjustedCycleDurationMs;

        const now = Date.now();
        const scheduleTimeout = (offset, statusText, logText) => {
            if (offset > 0) {
                const timeoutId = setTimeout(() => {
                    playBeep();
                    updateStatus(timer.statusElement, statusText);
                    setTimeout(() => updateStatus(timer.statusElement, ''), 1000);
                    console.log(logText);
                    timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
                }, offset);
                timer.timeouts.push(timeoutId);
            }
        };

        timer.nextBeepTimes = [];
        let nextBeepOffsetMs = 0;

        const adjustedBeep1OffsetMs = (beep1Offset * 1000) + (timer.adjustment * 1000);
        const adjustedBeep2OffsetMs = (beep2Offset * 1000) + (timer.adjustment * 1000);

        if (currentCycleElapsed < adjustedBeep1OffsetMs) {
            nextBeepOffsetMs = adjustedBeep1OffsetMs - currentCycleElapsed;
            scheduleTimeout(nextBeepOffsetMs, `音1鳴動 (サイクルから${beep1Offset}秒)`, `機能${timerId}: サイクルから${beep1Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes.push(now + nextBeepOffsetMs);

            const beep2OffsetFromNow = nextBeepOffsetMs + (adjustedBeep2OffsetMs - adjustedBeep1OffsetMs);
            scheduleTimeout(beep2OffsetFromNow, `音2鳴動 (サイクルから${beep2Offset}秒)`, `機能${timerId}: サイクルから${beep2Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes.push(now + beep2OffsetFromNow);
        } else if (currentCycleElapsed < adjustedBeep2OffsetMs) {
            nextBeepOffsetMs = adjustedBeep2OffsetMs - currentCycleElapsed;
            scheduleTimeout(nextBeepOffsetMs, `音2鳴動 (サイクルから${beep2Offset}秒)`, `機能${timerId}: サイクルから${beep2Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes.push(now + nextBeepOffsetMs);

            const beep1OffsetFromNextCycleStart = (adjustedCycleDurationMs - currentCycleElapsed) + adjustedBeep1OffsetMs;
            timer.nextBeepTimes.push(now + beep1OffsetFromNextCycleStart);
        } else {
            nextBeepOffsetMs = (adjustedCycleDurationMs - currentCycleElapsed) + adjustedBeep1OffsetMs;
            scheduleTimeout(nextBeepOffsetMs, `音1鳴動 (サイクルから${beep1Offset}秒)`, `機能${timerId}: サイクルから${beep1Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes.push(now + nextBeepOffsetMs);

            const beep2OffsetFromNextCycleStart = nextBeepOffsetMs + (adjustedBeep2OffsetMs - adjustedBeep1OffsetMs);
            timer.nextBeepTimes.push(now + beep2OffsetFromNextCycleStart);
        }

        timer.nextBeepTimes.sort((a,b) => a - b);

        if (timer.updateInterval) clearInterval(timer.updateInterval);
        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, '', timerId);
        }, 1000);

        const intervalId = setInterval(() => {
            scheduleCycleBeeps(timerId);
        }, adjustedCycleDurationMs);
        timer.intervals.push(intervalId);
    }

    function startFixedTimer(timerId) {
        const timer = timers[timerId];

        resetTimer(timerId);

        timer.startTime = Date.now();
        updateStatus(timer.statusElement, 'タイマーを開始しました。');
        setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);

        const beep105Time = timer.startTime + (105 * 1000);
        const beep110Time = timer.startTime + (110 * 1000);
        timer.nextBeepTimes = [beep105Time, beep110Time].sort((a, b) => a - b);

        const timeout1 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '105秒経過！');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 105秒後に音が鳴りました。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
        }, 105 * 1000);

        const timeout2 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, '110秒経過！完了。', '#2ecc71');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: 110秒後に音が鳴りました。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
            if (timer.updateInterval) {
                 clearInterval(timer.updateInterval);
                 timer.updateInterval = null;
            }
            // タイマー終了後、自動的にリセットして再スタート可能にする
            resetTimer(timerId);
        }, 110 * 1000);

        timer.timeouts.push(timeout1, timeout2);

        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, '', timerId);
        }, 1000);
    }

    function startRepeatingTimer(timerId) {
        const timer = timers[timerId];

        // 機能3が開始される際は機能2をリセット
        if (timerId === 7) {
            resetTimer(6);
        } else if (timerId === 6) { // 機能2が開始される際は機能3をリセット
            resetTimer(7);
        }

        resetTimer(timerId);

        timer.startTime = Date.now();
        updateStatus(timer.statusElement, 'タイマーを開始しました。');
        setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);

        scheduleInitialBeeps(timerId);

        timer.updateInterval = setInterval(() => {
            updateNextBeepTime(timer.nextBeepElement, '', timerId);
        }, 1000);

        updateAdjustmentInfo(timer.adjustmentElement, timer.adjustment);
    }

    function scheduleCycleBeeps(timerId) {
        const timer = timers[timerId];
        const now = Date.now();
        const { cycleDuration, beep1Offset, beep2Offset } = timer.config;

        const adjustedBeep1OffsetMs = (beep1Offset * 1000) + (timer.adjustment * 1000);
        const adjustedBeep2OffsetMs = (beep2Offset * 1000) + (timer.adjustment * 1000);

        const cycleBeep1Time = now + adjustedBeep1OffsetMs;
        const cycleBeep2Time = now + adjustedBeep2OffsetMs;

        timer.nextBeepTimes.push(cycleBeep1Time, cycleBeep2Time);
        timer.nextBeepTimes.sort((a, b) => a - b);

        const cycleTimeout1 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, `音1鳴動 (サイクルから${beep1Offset}秒)`, '#f39c12');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: サイクルから${beep1Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
        }, adjustedBeep1OffsetMs);

        const cycleTimeout2 = setTimeout(() => {
            playBeep();
            updateStatus(timer.statusElement, `音2鳴動 (サイクルから${beep2Offset}秒)`, '#f39c12');
            setTimeout(() => { updateStatus(timer.statusElement, ''); }, 1000);
            console.log(`機能${timerId}: サイクルから${beep2Offset}秒後に音が鳴りました。`);
            timer.nextBeepTimes = timer.nextBeepTimes.filter(t => t > Date.now());
        }, adjustedBeep2OffsetMs);
        timer.timeouts.push(cycleTimeout1, cycleTimeout2);
    }

    // ===================================
    // DOM初期化
    // ===================================
    
    // ページロード時に全てのタイマーの表示を初期化
    function initializeDOM() {
        // 機能1のタイマーを動的に生成
        const feature1Container = document.getElementById('feature1-container');
        if (feature1Container) {
            feature1Container.innerHTML = ''; // 既存の要素をクリア
            for (let i = 1; i <= 4; i++) {
                const timerItem = document.createElement('div');
                timerItem.className = 'timer-item';
                timerItem.setAttribute('data-timer-id', i);
                timerItem.innerHTML = `
                    <h3>タイマー 1-${i}</h3>
                    <div class="timer-controls">
                        <button class="start-button">スタート</button>
                    </div>
                    <div class="status-group">
                        <div class="current-status"></div>
                        <div class="next-beep-time"></div>
                    </div>
                `;
                feature1Container.appendChild(timerItem);
            }
        }

        // 全てのボタンにイベントリスナーを設定
        document.querySelectorAll('.all-reset-button').forEach(button => {
            button.addEventListener('click', resetAllTimers);
        });

        // 機能1, 2, 3の全てのタイマーにイベントリスナーを登録
        document.querySelectorAll('.timer-section[data-timer-id], .timer-item[data-timer-id]').forEach(element => {
            const timerId = parseInt(element.dataset.timerId);
            const timer = timers[timerId];
            
            timer.sectionElement = element;
            timer.statusElement = element.querySelector('.current-status');
            timer.nextBeepElement = element.querySelector('.next-beep-time');
            timer.adjustmentElement = element.querySelector('.adjustment-info');

            element.querySelector('.start-button').addEventListener('click', () => {
                if (timerId >= 1 && timerId <= 4) {
                    startFixedTimer(timerId);
                } else {
                    startRepeatingTimer(timerId);
                }
            });

            const resetButton = element.querySelector('.reset-button');
            if (resetButton) {
                resetButton.addEventListener('click', () => resetTimer(timerId));
            }

            element.querySelectorAll('.adjust-button.minus').forEach(button => {
                button.addEventListener('click', () => adjustTimer(timerId, -0.1));
            });
            element.querySelectorAll('.adjust-button.plus').forEach(button => {
                button.addEventListener('click', () => adjustTimer(timerId, 0.1));
            });

            resetTimer(timerId);
        });
    }

    // 初期化処理を実行
    initializeDOM();

});
