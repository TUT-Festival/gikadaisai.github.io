/**
 * festival-countdown.js
 * site-config.json の日程情報をもとにフェスティバルカウントダウンを表示する。
 * site-loader.js が発行する 'siteConfigLoaded' イベントを待って動作開始する。
 */
document.addEventListener('siteConfigLoaded', function (e) {
    'use strict';

    var config = e.detail;
    var festivalCountDownDate = new Date(config.dates.day1).getTime();
    var displayText = config.dates.displayText;

    // --- 開場時間の表示 ---
    var openingTimeDate = new Date(festivalCountDownDate);
    var openingHours = openingTimeDate.getHours().toString().padStart(2, '0');
    var openingMinutes = openingTimeDate.getMinutes().toString().padStart(2, '0');
    var openingTimeEl = document.getElementById('opening-time');
    if (openingTimeEl) {
        openingTimeEl.innerText = openingHours + ':' + openingMinutes;
    }

    // --- 日付表示の更新 ---
    var eventDateEl = document.querySelector('.event-date');
    if (eventDateEl) {
        eventDateEl.textContent = displayText;
    }

    // --- カウントダウン ---
    var countdownFunction = setInterval(function () {
        var now = new Date().getTime();
        var distance = festivalCountDownDate - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var daysEl = document.getElementById('days');
        var hoursEl = document.getElementById('hours');
        var minutesEl = document.getElementById('minutes');
        var secondsEl = document.getElementById('seconds');

        if (daysEl) daysEl.innerText = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, '0');

        if (distance < 0) {
            clearInterval(countdownFunction);
            var countdownCard = document.querySelector('.countdown-card');
            if (countdownCard) {
                countdownCard.innerHTML =
                    "<p class='event-date'>" + displayText + "</p>" +
                    "<p style='font-size: 2rem; font-weight: bold; margin-top: 1rem;'>技科大祭 開催中！</p>";
            }
        }
    }, 1000);
});
