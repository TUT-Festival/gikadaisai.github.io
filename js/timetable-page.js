(function () {
  "use strict";

  var JAPAN_OFFSET = "+09:00";

  document.addEventListener("DOMContentLoaded", function () {
    var cards = Array.from(document.querySelectorAll(".tt-event"));
    var liveCard = document.querySelector(".tt-live-card");
    var liveLabel = document.getElementById("tt-live-label");
    var liveTitle = document.getElementById("tt-live-title");
    var liveMeta = document.getElementById("tt-live-meta");
    var liveJump = document.getElementById("tt-live-jump");

    if (!cards.length || !liveCard || !liveJump) return;

    var events = cards.map(readEvent).sort(function (a, b) {
      return a.start - b.start;
    });

    liveJump.addEventListener("click", function () {
      var target = document.querySelector(
        '[data-event-id="' + liveJump.dataset.eventId + '"]',
      );
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.addEventListener(
        "blur",
        function () {
          target.removeAttribute("tabindex");
        },
        { once: true },
      );
    });

    updateLiveStatus();
    window.setInterval(updateLiveStatus, 30000);

    function readEvent(card) {
      var date = card.closest(".tt-day-panel").dataset.date;
      return {
        card: card,
        id: card.dataset.eventId,
        title: card.dataset.title,
        date: date,
        startLabel: card.dataset.start,
        endLabel: card.dataset.end,
        start: new Date(date + "T" + card.dataset.start + ":00" + JAPAN_OFFSET),
        end: new Date(date + "T" + card.dataset.end + ":00" + JAPAN_OFFSET),
      };
    }

    function updateLiveStatus() {
      var now = new Date();
      var current = events.find(function (event) {
        return event.start <= now && now < event.end;
      });
      var next = events.find(function (event) {
        return event.start > now;
      });

      cards.forEach(function (card) {
        card.classList.remove("is-live", "is-next");
      });

      if (current) {
        current.card.classList.add("is-live");
        liveCard.dataset.state = "live";
        liveLabel.textContent = "ただいま開催中";
        liveTitle.textContent = current.title;
        liveMeta.textContent =
          current.endLabel +
          "終了予定 · あと" +
          formatDistance(current.end - now);
        setLiveTarget(current);
        return;
      }

      if (next) {
        next.card.classList.add("is-next");
        liveCard.dataset.state = "upcoming";
        liveLabel.textContent = "次の企画";
        liveTitle.textContent = next.title;
        liveMeta.textContent =
          formatDateLabel(next.date) +
          " " +
          next.startLabel +
          "開始 · あと" +
          formatDistance(next.start - now);
        setLiveTarget(next);
        return;
      }

      liveCard.dataset.state = "finished";
      liveLabel.textContent = "開催終了";
      liveTitle.textContent = "すべてのステージ企画が終了しました";
      liveMeta.textContent = "ご来場ありがとうございました。";
      liveJump.hidden = true;
      delete liveJump.dataset.eventId;
    }

    function setLiveTarget(event) {
      liveJump.hidden = false;
      liveJump.dataset.eventId = event.id;
    }

    function formatDateLabel(date) {
      var parts = date.split("-");
      var weekdays = { "2026-10-10": "土", "2026-10-11": "日" };
      return (
        Number(parts[1]) +
        "月" +
        Number(parts[2]) +
        "日（" +
        weekdays[date] +
        "）"
      );
    }

    function formatDistance(milliseconds) {
      var totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
      var days = Math.floor(totalMinutes / 1440);
      var hours = Math.floor((totalMinutes % 1440) / 60);
      var minutes = totalMinutes % 60;

      if (days > 0) return days + "日" + (hours ? hours + "時間" : "");
      if (hours > 0) return hours + "時間" + (minutes ? minutes + "分" : "");
      return minutes + "分";
    }
  });
})();
