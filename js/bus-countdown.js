/**
 * bus-countdown.js
 * timetable.json を読み込み、次のバスまでのカウントダウンを表示する。
 * index.html と access.html の両方で使用される共通スクリプト。
 */
document.addEventListener('DOMContentLoaded', async function () {
    'use strict';

    var countdownDisplayEl = document.getElementById('bus-countdown-display');
    var nextBusTimeEl = document.getElementById('next-bus-time');
    var busScheduleNoteEl = document.getElementById('bus-schedule-note');
    var nextBusInfoEl = document.querySelector('p.next-bus-info');

    if (!countdownDisplayEl) return;

    // --- 時刻表データの取得 ---
    async function fetchTimetable() {
        try {
            var response = await fetch('js/timetable.json');
            if (!response.ok) throw new Error('時刻表ファイルが読み込めませんでした。');
            return await response.json();
        } catch (error) {
            console.error(error);
            if (countdownDisplayEl) countdownDisplayEl.innerHTML = '<p>時刻表データを取得できませんでした。</p>';
            return null;
        }
    }

    var timetable = await fetchTimetable();
    if (!timetable) return;

    // --- カウントダウン更新処理 ---
    function updateBusCountdown() {
        var now = new Date();
        var day = now.getDay(); // 0 = Sunday, 6 = Saturday
        var currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        var schedule;
        if (day === 6) {
            schedule = timetable.saturday;
            if (busScheduleNoteEl) {
                busScheduleNoteEl.textContent = '';
                busScheduleNoteEl.style.display = 'none';
            }
        } else if (day === 0) {
            schedule = timetable.sunday;
            if (busScheduleNoteEl) {
                busScheduleNoteEl.textContent = '';
                busScheduleNoteEl.style.display = 'none';
            }
        } else {
            schedule = timetable.weekday;
            if (busScheduleNoteEl) {
                busScheduleNoteEl.textContent = '※表示は平日ダイヤです。技科大祭当日の土日ダイヤとは異なります。';
                busScheduleNoteEl.style.display = 'block';
            }
        }

        var nextBus = schedule.find(function (time) { return time > currentTime; });
        var nextBusDate = new Date();

        // 今日のバスがない場合、明日の始発を探す
        if (!nextBus) {
            var tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            var tomorrowDay = tomorrow.getDay();

            var tomorrowSchedule;
            if (tomorrowDay === 6) { tomorrowSchedule = timetable.saturday; }
            else if (tomorrowDay === 0) { tomorrowSchedule = timetable.sunday; }
            else { tomorrowSchedule = timetable.weekday; }

            nextBus = tomorrowSchedule[0];
            nextBusDate = tomorrow;
        }

        if (!nextBus) {
            countdownDisplayEl.innerHTML = '<p>次のバス情報が見つかりません。</p>';
            if (nextBusTimeEl) nextBusTimeEl.textContent = '--:--';
            return;
        }

        var parts = nextBus.split(':');
        nextBusDate.setHours(parts[0], parts[1], 0, 0);

        var distance = nextBusDate.getTime() - now.getTime();

        if (distance > 3600000) {
            // 次のバスまで1時間以上
            countdownDisplayEl.innerHTML = '<p style="font-size: 1.1rem; font-weight: 500;">次のバスは <strong>' + nextBus + '</strong> 発です</p>';
            if (nextBusInfoEl) nextBusInfoEl.style.display = 'none';
        } else {
            // 1時間を切ったらカウントダウン表示
            if (nextBusInfoEl) nextBusInfoEl.style.display = 'block';

            countdownDisplayEl.innerHTML =
                '<p>次のバスまであと</p>' +
                '<div class="time-container">' +
                '    <span id="bus-minutes">--</span><small>分</small>' +
                '    <span id="bus-seconds">--</span><small>秒</small>' +
                '</div>';

            var mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var secs = Math.floor((distance % (1000 * 60)) / 1000);

            var busMinutesEl = document.getElementById('bus-minutes');
            var busSecondsEl = document.getElementById('bus-seconds');

            if (busMinutesEl) busMinutesEl.textContent = mins.toString().padStart(2, '0');
            if (busSecondsEl) busSecondsEl.textContent = secs.toString().padStart(2, '0');
            if (nextBusTimeEl) nextBusTimeEl.textContent = nextBus + ' 発';
        }
    }

    setInterval(updateBusCountdown, 1000);
    updateBusCountdown();
});
