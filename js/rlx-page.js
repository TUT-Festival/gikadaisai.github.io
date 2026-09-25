/**
 * rlx-page.js
 * トップページ（index.html）と「昨年から今年へ」（journey.html）が共有する
 * プロポーザル風レイアウトの挙動をまとめたもの。
 *
 *   1. Rellax（背景シェイプの視差スクロール）の初期化
 *   2. 左サイドバーのセクションナビ（画面固定・現在地ハイライト）
 *   3. スマホ用のセクション移動メニュー（右下のボタン）
 *
 * セクションの構成はページごとに異なるため、特定のIDを決め打ちせず
 * DOM から「最初の .rlx-section」と「最後の section[id]」を探して判定する。
 * 生成が終わってから高さを測る必要があるので、
 * 呼び出しは site-config 読み込み後（window.onSiteConfig 内）に行うこと。
 */
(function () {
  "use strict";

  // --- Rellax（入場アニメーション完了後に開始） ---
  function initRellaxWhenReady() {
    if (typeof Rellax === "undefined") return;

    var rellaxEls = document.querySelectorAll(".rellax");
    var animatedEls = [];
    rellaxEls.forEach(function (el) {
      if (
        el.classList.contains("anim-slide-t") ||
        el.classList.contains("anim-slide-b") ||
        el.classList.contains("anim-slide-l") ||
        el.classList.contains("anim-slide-r")
      ) {
        animatedEls.push(el);
      }
    });

    function initRellax() {
      animatedEls.forEach(function (el) {
        el.style.animation = "none";
      });
      new Rellax(".rellax", { speed: -2, center: false, round: true });
    }

    if (animatedEls.length === 0) {
      initRellax();
      return;
    }

    var completed = 0;
    animatedEls.forEach(function (el) {
      el.addEventListener("animationend", function handler() {
        el.removeEventListener("animationend", handler);
        completed++;
        if (completed >= animatedEls.length) initRellax();
      });
    });
    // アニメーションが発火しなかった場合の保険
    setTimeout(function () {
      if (completed < animatedEls.length) initRellax();
    }, 3000);
  }

  // --- サイドバー: position:fixed で画面固定 + 表示範囲制御 ---
  function initSidebar() {
    var nav = document.querySelector(".rlx-sidebar-nav");
    var mascot = document.querySelector(".sidebar-mascot");
    var sidebar = document.querySelector(".rlx-sidebar");
    // 表示開始の基準点: 本文カラムの最初のセクション
    var firstSection = document.querySelector(".rlx-content .rlx-section");
    // 表示終了の基準点: ページ最後のセクション
    var allSections = document.querySelectorAll("main section[id]");
    var lastSection = allSections[allSections.length - 1];
    if (!nav || !sidebar || !firstSection) return;

    var hideTimer = null;
    function updateSidebar() {
      var rect = firstSection.getBoundingClientRect();
      var sectionVisible = rect.top < 80;
      // 最終セクションの底が画面内にあるうちは表示を維持
      var pastLastSection = lastSection
        ? lastSection.getBoundingClientRect().bottom < 80 + nav.offsetHeight
        : true;

      if (sectionVisible && !pastLastSection) {
        clearTimeout(hideTimer);
        var sr = sidebar.getBoundingClientRect();
        nav.style.left = sr.left + "px";
        nav.classList.add("is-fixed");
        if (mascot) {
          mascot.style.left = sr.left + "px";
          mascot.classList.add("is-fixed");
        }
        requestAnimationFrame(function () {
          nav.classList.add("is-visible");
          if (mascot) mascot.classList.add("is-visible");
        });
      } else if (nav.classList.contains("is-visible")) {
        nav.classList.remove("is-visible");
        if (mascot) mascot.classList.remove("is-visible");
        clearTimeout(hideTimer);
        hideTimer = setTimeout(function () {
          nav.classList.remove("is-fixed");
          if (mascot) mascot.classList.remove("is-fixed");
        }, 500);
      }
    }

    window.addEventListener("scroll", updateSidebar, { passive: true });
    window.addEventListener("resize", updateSidebar);
    updateSidebar();
  }

  // --- サイドバー: スクロール位置に応じて現在地をハイライト ---
  function initSidebarActiveLink() {
    var sections = [];
    document.querySelectorAll(".rlx-nav-link").forEach(function (link) {
      var href = link.getAttribute("href") || "";
      // 他ページへのリンク（index.html#Date など）は対象外
      if (href.charAt(0) !== "#") return;
      var el = document.querySelector(href);
      if (el) sections.push({ el: el, link: link });
    });
    if (sections.length === 0) return;

    window.addEventListener(
      "scroll",
      function () {
        var st = window.scrollY + 120;
        sections.forEach(function (s) {
          var top = s.el.offsetTop;
          var bottom = top + s.el.offsetHeight;
          s.link.classList.toggle("active", st >= top && st < bottom);
        });
      },
      { passive: true },
    );
  }

  // --- スマホ用セクション移動メニュー ---
  function initMobileNav() {
    var fab = document.getElementById("rlx-mobile-nav-trigger");
    var overlay = document.getElementById("rlx-mobile-nav-overlay");
    if (!fab || !overlay) return;

    var closeBtn = overlay.querySelector(".rlx-mobile-nav-close");
    var navItems = overlay.querySelectorAll(".rlx-mobile-nav-item");

    function toggleNav(show) {
      overlay.classList.toggle("is-active", show);
      document.body.style.overflow = show ? "hidden" : "";
    }

    fab.addEventListener("click", function () {
      toggleNav(true);
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        toggleNav(false);
      });
    }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) toggleNav(false);
    });
    navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        toggleNav(false);
      });
    });
  }

  window.rlxPage = {
    init: function () {
      initRellaxWhenReady();
      initSidebar();
      initSidebarActiveLink();
      initMobileNav();
    },
  };
})();
