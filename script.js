<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>タイマーアプリ</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>タイマーアプリ</h1>
        <button class="all-reset-button">全リセット</button>
    </header>
    <main>
        <section id="feature1-container" class="timer-grid">
            </section>

        <section id="feature2" class="timer-section" data-timer-id="6">
            <h3>機能2</h3>
            <div class="timer-controls">
                <button class="start-button">スタート</button>
                <button class="reset-button">リセット</button>
            </div>
            <div class="status-group">
                <div class="current-status"></div>
                <div class="next-beep-time"></div>
            </div>
            <div class="adjustment-controls">
                <button class="adjust-button minus">ー</button>
                <span class="adjustment-info"></span>
                <button class="adjust-button plus">＋</button>
            </div>
        </section>

        <section id="feature3" class="timer-section" data-timer-id="7">
            <h3>機能3</h3>
            <div class="timer-controls">
                <button class="start-button">スタート</button>
                <button class="reset-button">リセット</button>
            </div>
            <div class="status-group">
                <div class="current-status"></div>
                <div class="next-beep-time"></div>
            </div>
            <div class="adjustment-controls">
                <button class="adjust-button minus">ー</button>
                <span class="adjustment-info"></span>
                <button class="adjust-button plus">＋</button>
            </div>
        </section>
    </main>

    <script src="script.js"></script>
</body>
</html>
