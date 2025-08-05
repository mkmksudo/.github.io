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
    
    // MP3ファイルの警告音を再生する関数
    function playBeep() {
        try {
            const audio = new Audio('beep.mp3'); // beep.mp3というファイルを読み込む
            audio.play().catch(e => console.error("音声の再生に失敗しました:", e));
        } catch (e) {
            console.error("音声の再生に失敗しました:", e);
        }
    }

    //
    // 以下、変更なし
    //
    
    // ... (rest of the script)
    // initializeDOM() から document.addEventListener('DOMContentLoaded' まで続く
    // ...
    
    // ページロード時に全てのタイマーの表示を初期化
    function initializeDOM() {
        // 機能1のタイマーを動的に生成
        const feature1Container = document.getElementById('feature1-container');
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
    
        // 全てのボタンにイベントリスナーを設定
        document.querySelectorAll('.all-reset-button').forEach(button => {
            button.addEventListener('click', resetAllTimers);
        });
    
        document.querySelectorAll('.timer-section[data-timer-id]').forEach(section => {
            const timerId = parseInt(section.dataset.timerId);
            const timer = timers[timerId];
            
            // 要素をタイマーオブジェクトに紐付け
            timer.sectionElement = section;
            timer.statusElement = section.querySelector('.current-status');
            timer.nextBeepElement = section.querySelector('.next-beep-time');
            timer.adjustmentElement = section.querySelector('.adjustment-info');
    
            // スタートボタン
            section.querySelector('.start-button').addEventListener('click', () => {
                if (timerId >= 1 && timerId <= 4) {
                    startFixedTimer(timerId);
                } else {
                    startRepeatingTimer(timerId);
                }
            });
    
            // リセットボタン (機能2, 3のみ)
            const resetButton = section.querySelector('.reset-button');
            if (resetButton) {
                resetButton.addEventListener('click', () => resetTimer(timerId));
            }
    
            // 誤差調整ボタン
            section.querySelectorAll('.adjust-button.minus').forEach(button => {
                button.addEventListener('click', () => adjustTimer(timerId, -0.1));
            });
            section.querySelectorAll('.adjust-button.plus').forEach(button => {
                button.addEventListener('click', () => adjustTimer(timerId, 0.1));
            });
    
            // 初期化
            resetTimer(timerId);
        });
        
        // 機能1のタイマー要素にもイベントリスナーを設定
        document.querySelectorAll('.timer-item').forEach(item => {
            const timerId = parseInt(item.dataset.timerId);
            const timer = timers[timerId];
    
            // 要素をタイマーオブジェクトに紐付け
            timer.sectionElement = item;
            timer.statusElement = item.querySelector('.current-status');
            timer.nextBeepElement = item.querySelector('.next-beep-time');
            
            // スタートボタン
            item.querySelector('.start-button').addEventListener('click', () => {
                startFixedTimer(timerId);
            });
            
            // 初期化
            resetTimer(timerId);
        });
    }
    
    // ... (rest of the script)
    // resetTimer から startRepeatingTimer まで続く
    // ...
    
    // resetTimer, resetAllTimers, updateStatus, updateNextBeepTime, updateAdjustmentInfo, adjustTimer,
    // scheduleInitialBeeps, scheduleRepeatingBeeps, startFixedTimer, startRepeatingTimer, scheduleCycleBeeps
    // などの関数がここに入る
    
    // ...
    
    // ページロード時の初期化処理
    initializeDOM();

});
