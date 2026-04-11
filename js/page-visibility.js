/**
 * page-visibility.js
 * site-config.json の pageVisibility 設定に基づき、false に設定されたページを
 * 「準備中」画面に切り替える。
 *
 * index.html が非公開の場合は「準備中」表示に加えて、
 * ご寄付・アクセス・お問い合わせへのリンクボタンも表示する。
 *
 * site-loader.js が発行する siteConfigLoaded イベントを利用する。
 * 既に window.siteConfig が設定済みの場合は即時実行する。
 */
(function () {
    'use strict';

    // 現在のページキーを URL から判定
    function getPageKey() {
        var pathname = window.location.pathname;
        var parts = pathname.split('/');
        var filename = parts[parts.length - 1];
        if (!filename || filename === '') return 'index';
        var key = filename.replace(/\.html$/i, '');
        return key || 'index';
    }

    function applyComingSoon(config) {
        var pageKey = getPageKey();
        var visibility = config.pageVisibility;

        // pageVisibility 設定がない、または対象ページが公開 (true) なら何もしない
        if (!visibility || visibility[pageKey] !== false) return;

        var festivalName = '第' + config.festivalNumber + '回' + config.festivalName;
        var isIndex = (pageKey === 'index');

        // index.html 非公開時のみリンクボタンを表示
        var linksHtml = '';
        if (isIndex) {
            linksHtml = [
                '<div class="coming-soon-links">',
                '  <a href="donation.html" class="coming-soon-link-btn">',
                '    <i class="fas fa-hand-holding-heart"></i>',
                '    <span>ご寄付</span>',
                '  </a>',
                '  <a href="access.html" class="coming-soon-link-btn">',
                '    <i class="fas fa-map-marker-alt"></i>',
                '    <span>アクセス</span>',
                '  </a>',
                '  <a href="contact.html" class="coming-soon-link-btn">',
                '    <i class="fas fa-envelope"></i>',
                '    <span>お問い合わせ</span>',
                '  </a>',
                '</div>'
            ].join('\n');
        }

        var html = [
            '<section class="coming-soon-section">',
            '  <div class="deco-circle deco-circle--dashed deco-circle--xl" style="top: -80px; left: -120px;"></div>',
            '  <div class="deco-circle deco-circle--filled deco-circle--lg" style="bottom: -60px; right: -40px;"></div>',
            '  <div class="deco-circle deco-circle--solid deco-circle--md" style="top: 30px; right: 10%;"></div>',
            '  <div class="coming-soon-content">',
            '    <p class="coming-soon-label">Coming Soon</p>',
            '    <h1 class="coming-soon-title">準備中</h1>',
            '    <p class="coming-soon-desc">' + festivalName + 'の情報を<br>鋭意準備中です。<br>今しばらくお待ちください。</p>',
            linksHtml,
            '  </div>',
            '</section>'
        ].join('\n');

        function replace() {
            var main = document.querySelector('main');
            if (main) main.innerHTML = html;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', replace);
        } else {
            replace();
        }
    }

    // site-loader.js がすでに config を設定済みなら即時実行、そうでなければイベント待ち
    if (window.siteConfig) {
        applyComingSoon(window.siteConfig);
    } else {
        document.addEventListener('siteConfigLoaded', function (e) {
            applyComingSoon(e.detail);
        });
    }
})();
