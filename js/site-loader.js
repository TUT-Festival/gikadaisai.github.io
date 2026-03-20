/**
 * site-loader.js
 * site-config.json を読み込み、全ページ共通の要素（ヘッダー・フッター等）を動的に注入する。
 * 各ページの <head>, <header>, <footer> 内のプレースホルダーを自動で書き換える。
 */
(async function () {
    'use strict';

    // --- site-config.json の読み込み ---
    let config;
    try {
        const res = await fetch('js/site-config.json');
        if (!res.ok) throw new Error('site-config.json の読み込みに失敗しました。');
        config = await res.json();
    } catch (e) {
        console.error(e);
        return;
    }

    const num = config.festivalNumber;
    const fullName = '第' + num + '回' + config.festivalName;

    // --- <title> の更新 ---
    const titleEl = document.querySelector('title');
    if (titleEl) {
        // 「第48回 技科大祭」の部分だけを差し替え（ページ固有の接頭辞は維持）
        titleEl.textContent = titleEl.textContent.replace(/第\d+回\s*技科大祭/, '第' + num + '回 ' + config.festivalName);
    }

    // --- meta description の更新 ---
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', metaDesc.getAttribute('content').replace(/第\d+回/, '第' + num + '回'));
    }

    // --- ヘッダーの更新 ---
    var headerGikadaisai = document.getElementById('gikadaisai');
    if (headerGikadaisai) {
        headerGikadaisai.textContent = fullName;
    }

    // --- フッターの更新 ---
    // ロゴ
    var footerGikadaisai = document.querySelector('.gikadaisai-footer');
    if (footerGikadaisai) {
        footerGikadaisai.textContent = fullName;
    }

    // 住所
    var footerAddress = document.querySelector('.footer-address');
    if (footerAddress) {
        footerAddress.innerHTML = config.address.postalCode + '<br>' + config.address.text;
    }

    // Copyright
    var footerBottom = document.querySelector('.footer-bottom small');
    if (footerBottom) {
        footerBottom.innerHTML = 'Copyright&copy; ' + fullName + '実行委員会 All Rights Reserved.';
    }

    // SNS リンク
    var footerLinks = document.querySelectorAll('.footer-nav a');
    footerLinks.forEach(function (a) {
        var href = a.getAttribute('href');
        if (href && href.includes('x.com')) {
            a.setAttribute('href', config.sns.x);
        } else if (href && href.includes('instagram.com')) {
            a.setAttribute('href', config.sns.instagram);
        } else if (href && href.includes('tut.ac.jp') && a.textContent.includes('大学公式')) {
            a.setAttribute('href', config.links.universityOfficial);
        }
    });

    // --- グローバルに config を公開（他スクリプトから参照可能にする）---
    window.siteConfig = config;

    // --- カスタムイベントを発行し、他のスクリプトが config 読み込み完了を検知できるようにする ---
    document.dispatchEvent(new CustomEvent('siteConfigLoaded', { detail: config }));
})();
