//===============================================================
// メニュー関連 (再デザイン版)
//===============================================================
$(function () {
  // 画面サイズに応じてPC用・モバイル用のクラスを切り替える関数
  var switchScreen = function () {
    var width = $(window).width();
    var breakpoint = 899; // モバイルとPC表示を切り替えるブレークポイント

    if (width <= breakpoint) {
      $("body").removeClass("large-screen").addClass("small-screen");
    } else {
      $("body").removeClass("small-screen").addClass("large-screen");
      // PC表示に切り替えた際に、モバイル用メニューが開いていれば閉じる
      $("#menubar").removeClass("is-open");
      $("#menubar_hdr").removeClass("ham");
    }
  };

  // ページ読み込み時に実行
  switchScreen();

  // ウィンドウリサイズ時に実行
  var resizeTimer;
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      switchScreen();
    }, 100);
  });

  // ハンバーガーメニューのクリックイベント
  // #menubar_hdr は site-loader.js が非同期で動的生成するため、
  // 直接バインドでは要素が未生成で登録されないことがある。
  // イベント委譲にすることで生成タイミングに依存しない。
  $(document).on("click", "#menubar_hdr", function (e) {
    e.stopPropagation();
    $(this).toggleClass("ham");
    $("#menubar").toggleClass("is-open");
  });

  // ドロップダウン外クリックで閉じる
  $(document).on("click", function (e) {
    if (
      $("#menubar").hasClass("is-open") &&
      !$(e.target).closest("header").length
    ) {
      $("#menubar").removeClass("is-open");
      $("#menubar_hdr").removeClass("ham");
    }
  });

  // モバイル用のドロップダウンメニュー
  $(".small-screen .ddmenu_parent > a").on("click", function (e) {
    // href="#" の場合のみドロップダウンを開閉
    if ($(this).attr("href") === "#") {
      e.preventDefault(); // リンクの遷移を無効化
      $(this).next("ul").slideToggle("fast");
      $(this).toggleClass("is-active");
    }
  });

  // PC用のドロップダウンはCSSのvisibility/opacityトランジションで制御
});

//===============================================================
// スムーススクロール（※バージョン2024-1）※ヘッダーの高さとマージンを取得する場合
//===============================================================
$(function () {
  var headerHeight = $("header").outerHeight();
  var headerMargin = parseInt($("header").css("margin-top"));
  var totalHeaderHeight = headerHeight + headerMargin;

  // スムーススクロールを実行する関数
  // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
  function smoothScroll(target) {
    // 存在しないアンカー（過去に配布したURLの #Highlights など）は何もしない。
    // $().offset() が undefined になり TypeError で落ちるのを防ぐ。
    var $target = target === "#" ? null : $(target);
    if ($target && $target.length === 0) return;
    // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
    var scrollTo =
      target === "#" ? 0 : $target.offset().top - totalHeaderHeight;
    // アニメーションでスムーススクロールを実行
    $("html, body").animate({ scrollTop: scrollTo }, 500);
  }

  // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
  // ページトップボタンは site-loader.js が後から挿入するため、
  // 個別バインドではなく document への委譲で受ける。
  $(document).on("click", 'a[href^="#"], .pagetop', function (e) {
    e.preventDefault(); // デフォルトのアンカー動作をキャンセル
    var id = $(this).attr("href") || "#"; // クリックされた要素のhref属性を取得、なければ'#'
    smoothScroll(id); // スムーススクロールを実行
  });

  // スクロールに応じてページトップボタンの表示/非表示を切り替え
  // opacity/visibility で制御 (display:none は position:fixed と相性が悪いため使わない)
  // document capture phase で全スクロールコンテナに対応
  function updatePagetop() {
    var scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    // 挿入タイミングに依存しないよう毎回引き直す
    $(".pagetop").toggleClass("is-visible", scrollTop >= 300);
  }
  updatePagetop(); // ロード時に即実行
  document.addEventListener("scroll", updatePagetop, {
    passive: true,
    capture: true,
  });

  // ページロード時にURLのハッシュが存在する場合の処理
  if (window.location.hash) {
    // ページの最上部に即時スクロールする
    $("html, body").scrollTop(0);
    // 少し遅延させてからスムーススクロールを実行
    setTimeout(function () {
      smoothScroll(window.location.hash);
    }, 10);
  }
});
