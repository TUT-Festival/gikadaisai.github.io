/**
 * festival-countdown.js
 * site-config.json の日程情報をもとにフェスティバルカウントダウンを表示する。
 * site-loader.js が発行する 'siteConfigLoaded' イベントを待って動作開始する。
 */
document.addEventListener('siteConfigLoaded', function (e) {
    'use strict';

    var config = e.detail;
    var festivalStart = new Date(config.dates.start).getTime();
    var festivalEnd   = config.dates.end ? new Date(config.dates.end).getTime() : null;
    var displayText   = config.dates.displayText;

    // --- 開場時間の表示 ---
    var openingTimeDate = new Date(festivalStart);
    var openingHours   = openingTimeDate.getHours().toString().padStart(2, '0');
    var openingMinutes = openingTimeDate.getMinutes().toString().padStart(2, '0');
    var openingTimeEl  = document.getElementById('opening-time');
    if (openingTimeEl) {
        openingTimeEl.innerText = openingHours + ':' + openingMinutes;
    }

    // --- 日付表示の更新 ---
    var eventDateEl = document.querySelector('.event-date');
    if (eventDateEl) {
        eventDateEl.textContent = displayText;
    }

    // --- カード書き換えヘルパー ---
    function setCardContent(html) {
        var card = document.querySelector('.countdown-card');
        if (card) card.innerHTML = html;
    }

    // --- 終了後なら即時表示して終了 ---
    if (festivalEnd && Date.now() >= festivalEnd) {
        setCardContent(
            "<p class='event-date'>" + displayText + "</p>" +
            "<p style='font-size: 1.6rem; font-weight: bold; margin-top: 1rem;'>ご来場<br>ありがとうございました</p>"
        );
        return;
    }

    // --- カウントダウン ---
    var countdownFunction = setInterval(function () {
        var now      = Date.now();
        var distance = festivalStart - now;

        // 開催中
        if (distance < 0) {
            // 終了判定
            if (festivalEnd && now >= festivalEnd) {
                clearInterval(countdownFunction);
                setCardContent(
                    "<p class='event-date'>" + displayText + "</p>" +
                    "<p style='font-size: 1.6rem; font-weight: bold; margin-top: 1rem;'>今年もご来場ありがとうございました</p>"
                );
                return;
            }
            // 開催中表示（初回のみ書き換え）
            clearInterval(countdownFunction);
            setCardContent(
                "<p class='event-date'>" + displayText + "</p>" +
                "<p style='font-size: 2rem; font-weight: bold; margin-top: 1rem;'>技科大祭 開催中！</p>"
            );
            // 終了時刻まで監視を継続
            if (festivalEnd) {
                var endWatcher = setInterval(function () {
                    if (Date.now() >= festivalEnd) {
                        clearInterval(endWatcher);
                        setCardContent(
                            "<p class='event-date'>" + displayText + "</p>" +
                            "<p style='font-size: 1.6rem; font-weight: bold; margin-top: 1rem;'>今年もご来場ありがとうございました</p>"
                        );
                    }
                }, 1000);
            }
            return;
        }

        // 開催前: カウントダウン更新
        var days    = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var daysEl    = document.getElementById('days');
        var hoursEl   = document.getElementById('hours');
        var minutesEl = document.getElementById('minutes');
        var secondsEl = document.getElementById('seconds');

        if (daysEl)    daysEl.innerText    = days.toString().padStart(2, '0');
        if (hoursEl)   hoursEl.innerText   = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, '0');
    }, 1000);
});
