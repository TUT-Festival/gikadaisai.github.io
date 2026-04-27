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

        // 各ページの準備中画面に共通でリンクボタンを表示
        var linksHtml = [
            '<div class="coming-soon-links coming-soon-links--grid">',
            '  <a href="support.html" class="coming-soon-link-btn">',
            '    <i class="fas fa-hand-holding-heart"></i>',
            '    <span>ご協賛・ご寄付</span>',
            '  </a>',
            '  <a href="proposal.html" class="coming-soon-link-btn">',
            '    <i class="fas fa-calendar-alt"></i>',
            '    <span>予定イベント</span>',
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

        var html = [
            '<section class="coming-soon-section">',
            '  <div class="deco-circle deco-circle--dashed deco-circle--xl" style="top: -80px; left: -120px;"></div>',
            '  <div class="deco-circle deco-circle--filled deco-circle--lg" style="bottom: -60px; right: -40px;"></div>',
            '  <div class="deco-circle deco-circle--solid deco-circle--md" style="top: 30px; right: 10%;"></div>',
            '  <div class="coming-soon-content">',
            '    <p class="coming-soon-label">Coming Soon</p>',
            '    <h1 class="coming-soon-title">準備中</h1>',
            '    <p class="coming-soon-desc">' + festivalName + 'の情報は<br>ただいま準備中です。<br>今しばらくお待ちください。</p>',
            linksHtml,
            '  </div>',
            '</section>',
            '<!-- Section: Sponsors -->',
            '<section style="position: relative;" class="bg1">',
            '    <div class="deco-circle deco-circle--dashed deco-circle--xl" style="top: -80px; left: -100px;"></div>',
            '    <div class="deco-circle deco-circle--solid deco-circle--md" style="bottom: 20px; right: 5%;"></div>',
            '    <div class="deco-circle deco-circle--dashed deco-circle--sm" style="top: 40%; right: -20px;"></div>',
            '    <h2 class="c"><span>Sponsors</span><span class="hosoku">ご協賛企業</span></h2>',
            '    <p class="c">昨年度の技科大祭開催にあたり、多くの企業の皆様にご支援、ご協力を賜りました。<br>心より感謝申し上げます。（順不同、敬称略）</p>',
            '    <div id="sponsor-grid" class="sponsor-grid"></div>',
            '</section>',
            '<!-- Section: Supporters -->',
            '<section style="position: relative;">',
            '    <div class="deco-circle deco-circle--filled deco-circle--md" style="top: 150px; left: -40px;"></div>',
            '    <div class="deco-circle deco-circle--solid deco-circle--sm" style="bottom: 100px; right: 8%;"></div>',
            '    <h2 class="c"><span>Supporters</span><span class="hosoku">ご寄付いただいた皆様</span></h2>',
            '    <p class="c">昨年度の技科大祭開催に際し、寄付サイト等を通じてご支援いただいた皆様をご紹介いたします。<br>皆様のご厚志に心より御礼申し上げます。（順不同、敬称略）</p>',
            '    <div id="supporter-grid" class="supporter-grid"></div>',
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
