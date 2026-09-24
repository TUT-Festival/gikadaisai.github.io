/**
 * sponsor-modal.js
 * 協賛企業ロゴを押したときに出す企業紹介モーダル。
 *
 * support.html の企業モーダルと同じ見た目・同じ情報（ランク／ロゴ／紹介文／
 * 公式サイト・SNSリンク）を、トップページでも出せるようにしたもの。
 * 表示するデータは sponsors.js の各企業オブジェクトをそのまま受け取る。
 *
 *   window.sponsorModal.open(sponsor, tierKey)
 *
 * マークアップはこのファイルが body の末尾に1度だけ生成するため、
 * HTML 側に置くものはない。CSS は css/index.css の
 * 「Sponsor Modal」セクションにある。
 *
 * ※ escape-html.js より後に読み込むこと。
 */
(function () {
  "use strict";

  // ランクの表示名（sponsor-wall.js の判定キーと対応）
  var TIER_LABELS = {
    top: "TOP SPONSOR ｜ トップスポンサー",
    premium: "PREMIUM SPONSOR ｜ プレミアムスポンサー",
    gold: "GOLD SPONSOR ｜ ゴールドスポンサー",
    silver: "SILVER SPONSOR ｜ シルバースポンサー",
    bronze: "BRONZE SPONSOR ｜ ブロンズスポンサー",
    supporter: "SUPPORTER ｜ サポーター",
  };

  // リンクボタンの種類判定（type 指定がなければ URL から推測する）
  var LINK_TYPES = [
    { key: "instagram", match: "instagram.com", label: "Instagram" },
    { key: "youtube", match: "youtube.com", label: "YouTube" },
    { key: "youtube", match: "youtu.be", label: "YouTube" },
    { key: "x", match: "x.com", label: "X" },
    { key: "x", match: "twitter.com", label: "X" },
    { key: "tiktok", match: "tiktok.com", label: "TikTok" },
  ];

  // アイコン（support.html のモーダルと同じもの）
  var ICONS = {
    website:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/></svg>',
  };

  var els = null; // 生成済みの要素をまとめて保持する
  var lastTrigger = null; // 閉じたときにフォーカスを戻す先

  /** モーダルの入れ物を1度だけ生成する */
  function build() {
    if (els) return els;

    var overlay = document.createElement("div");
    overlay.className = "sponsor-modal";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "sponsor-modal-name");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="sponsor-modal__card">' +
      '<button type="button" class="sponsor-modal__close" aria-label="閉じる">&times;</button>' +
      '<p class="sponsor-modal__tier"></p>' +
      '<div class="sponsor-modal__logo"></div>' +
      '<h2 class="sponsor-modal__name" id="sponsor-modal-name"></h2>' +
      '<div class="sponsor-modal__line"></div>' +
      '<p class="sponsor-modal__message"></p>' +
      '<div class="sponsor-modal__links"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    els = {
      overlay: overlay,
      card: overlay.querySelector(".sponsor-modal__card"),
      close: overlay.querySelector(".sponsor-modal__close"),
      tier: overlay.querySelector(".sponsor-modal__tier"),
      logo: overlay.querySelector(".sponsor-modal__logo"),
      name: overlay.querySelector(".sponsor-modal__name"),
      message: overlay.querySelector(".sponsor-modal__message"),
      links: overlay.querySelector(".sponsor-modal__links"),
    };

    els.close.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) close();
    });

    return els;
  }

  /** リンク1件の種類を決める */
  function linkTypeOf(link) {
    var url = link.url || "";
    for (var i = 0; i < LINK_TYPES.length; i++) {
      if (
        link.type === LINK_TYPES[i].key ||
        url.indexOf(LINK_TYPES[i].match) !== -1
      ) {
        return LINK_TYPES[i];
      }
    }
    return { key: "website", label: "Webサイト" };
  }

  /** 公式サイト・SNSのボタンを組み立てる */
  function renderLinks(container, sponsor) {
    container.innerHTML = "";
    var links = Array.isArray(sponsor.links) ? sponsor.links : [];
    links.forEach(function (link) {
      if (!link.url || link.url.trim() === "") return;
      var type = linkTypeOf(link);
      var btn = document.createElement("a");
      btn.href = link.url;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
      btn.className = "sponsor-modal__link sponsor-modal__link--" + type.key;
      btn.innerHTML =
        (ICONS[type.key] || ICONS.website) +
        "<span>" +
        escapeHtml(link.label || type.label) +
        "</span>";
      container.appendChild(btn);
    });
  }

  /**
   * モーダルを開く。
   * @param {object} sponsor sponsors.js の1件
   * @param {string} [tierKey] ランクキー（top / premium / gold / silver / bronze / supporter）
   * @param {HTMLElement} [trigger] 閉じたときにフォーカスを戻す要素
   */
  function open(sponsor, tierKey, trigger) {
    if (!sponsor) return;
    var m = build();
    lastTrigger = trigger || null;

    m.tier.textContent = TIER_LABELS[tierKey] || "SPONSOR ｜ ご協賛";
    m.name.textContent = sponsor.name || "";

    if (sponsor.logo && sponsor.logo.trim() !== "") {
      m.logo.innerHTML =
        '<img src="' +
        escapeHtml(sponsor.logo) +
        '" alt="' +
        escapeHtml(sponsor.name) +
        '">';
      m.logo.classList.add("is-active");
    } else {
      m.logo.innerHTML = "";
      m.logo.classList.remove("is-active");
    }

    var desc = sponsor.description || "";
    m.message.textContent =
      desc.trim() !== "" && desc !== "後で挿入"
        ? desc
        : "技科大祭をご支援いただいています。皆さまのご協力によって、開学50周年を迎える豊橋技術科学大学の技科大祭を、さらに大きな祭りへ。";

    renderLinks(m.links, sponsor);

    m.overlay.hidden = false;
    // display: none の解除と同じフレームでクラスを付けると transition が走らないため、
    // 一度レイアウトを確定させてからクラスを付ける
    void m.overlay.offsetHeight;
    m.overlay.classList.add("is-active");
    document.body.classList.add("modal-open");
    m.card.scrollTop = 0;
    m.close.focus();
  }

  /** モーダルを閉じる */
  function close() {
    if (!els || els.overlay.hidden) return;
    els.overlay.classList.remove("is-active");
    document.body.classList.remove("modal-open");
    var overlay = els.overlay;
    window.setTimeout(function () {
      if (!overlay.classList.contains("is-active")) overlay.hidden = true;
    }, 300);
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
    lastTrigger = null;
  }

  window.sponsorModal = { open: open, close: close };
})();
