/**
 * sponsor-wall.js
 * トップページの「ご協賛・ご寄付いただいた皆様」セクションに
 * 協賛企業のロゴを協賛額ランク順（＝表示サイズ順）で並べる。
 *
 * データは sponsors.js（support.html と共用）。
 * 金額そのものはページに出さず、ランク判定にだけ使う。
 * ロゴを押すと support.html と同じ企業紹介モーダル（js/sponsor-modal.js）が開く。
 * 個人寄附者一覧などの詳細は support.html 側で扱う。
 *
 * ※このファイルは sponsors.js・js/sponsor-modal.js の後に読み込むこと。
 */
(function () {
  "use strict";

  var wall = document.getElementById("sponsor-wall");
  var section = document.getElementById("Sponsors");
  if (!wall || typeof sponsors === "undefined") {
    if (section) section.hidden = true;
    return;
  }

  var TIER_ORDER = ["top", "premium", "gold", "silver", "bronze", "supporter"];

  function tierOf(s) {
    if (s.name && s.name.indexOf("名古屋TONKAN") !== -1) return "premium";
    var amount = s.amount || 0;
    if (amount >= 500000) return "top";
    if (amount >= 150000) return "premium";
    if (amount >= 100000) return "gold";
    if (amount >= 50000) return "silver";
    if (amount >= 30000) return "bronze";
    return "supporter";
  }

  var groups = {};
  sponsors.forEach(function (s, index) {
    var t = tierOf(s);
    (groups[t] || (groups[t] = [])).push({ sponsor: s, index: index });
  });

  var html = "";
  TIER_ORDER.forEach(function (t) {
    var list = groups[t];
    if (!list || list.length === 0) return;
    html += '<div class="sponsor-wall__tier sponsor-wall__tier--' + t + '">';
    list.forEach(function (entry) {
      var s = entry.sponsor;
      var inner =
        s.logo && s.logo.trim() !== ""
          ? '<img src="' +
            escapeHtml(s.logo) +
            '" alt="' +
            escapeHtml(s.name) +
            '">'
          : '<span class="sponsor-wall__name">' +
            escapeHtml(s.name) +
            "</span>";
      // ボタンにしてキーボードでも開けるようにする
      html +=
        '<button type="button" class="sponsor-wall__card" ' +
        'data-sponsor-index="' +
        entry.index +
        '" data-sponsor-tier="' +
        t +
        '" aria-haspopup="dialog" aria-label="' +
        escapeHtml(s.name) +
        'の紹介を見る">' +
        inner +
        "</button>";
    });
    html += "</div>";
  });
  wall.innerHTML = html;

  // クリック（＝モーダル表示）はカードごとに登録せず、一覧側でまとめて受ける
  wall.addEventListener("click", function (e) {
    var card = e.target.closest(".sponsor-wall__card");
    if (!card || !window.sponsorModal) return;
    var sponsor = sponsors[Number(card.dataset.sponsorIndex)];
    window.sponsorModal.open(sponsor, card.dataset.sponsorTier, card);
  });
})();
