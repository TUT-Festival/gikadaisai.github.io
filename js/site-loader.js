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
    const theme = config.theme;
    const univName = config.universityName;
    const fullName = '第' + num + '回' + config.festivalName;
    const festivalDateText = config.dates.displayText;

    // --- 正規表現 ---
    const festivalReg = /第(?:\d+|--|XX)回\s*技科大祭/g;
    const numOnlyReg = /第(?:\d+|--|XX)回/g;
    const themeReg = /{{THEME}}/g;
    const dateReg = /{{DATE}}/g;
    const univReg = /豊橋技術科学大学|{{UNIVERSITY}}/g;

    // --- <title> の更新 ---
    const titleEl = document.querySelector('title');
    if (titleEl) {
        titleEl.textContent = titleEl.textContent
            .replace(festivalReg, fullName)
            .replace(themeReg, theme)
            .replace(univReg, univName);
    }

    // --- 各種 Meta タグの更新 (Description, OGP, Twitter, Images) ---
    const metaUpdates = [
        { selector: 'meta[name="description"]', attr: 'content' },
        { selector: 'meta[property="og:site_name"]', attr: 'content' },
        { selector: 'meta[property="og:title"]', attr: 'content' },
        { selector: 'meta[property="og:description"]', attr: 'content' },
        { selector: 'meta[name="twitter:title"]', attr: 'content' },
        { selector: 'meta[name="twitter:description"]', attr: 'content' },
        { selector: 'meta[property="og:image"]', attr: 'content', val: config.images.poster, overwrite: true },
        { selector: 'meta[name="twitter:image"]', attr: 'content', val: config.images.poster, overwrite: true }
    ];

    metaUpdates.forEach(m => {
        const el = document.querySelector(m.selector);
        if (el) {
            if (m.overwrite) {
                el.setAttribute(m.attr, m.val);
            } else {
                let content = el.getAttribute(m.attr);
                content = content
                    .replace(festivalReg, fullName)
                    .replace(numOnlyReg, '第' + num + '回')
                    .replace(themeReg, theme)
                    .replace(dateReg, festivalDateText)
                    .replace(univReg, univName);
                el.setAttribute(m.attr, content);
            }
        }
    });

    // --- 隠し見出し (SEO/アクセシビリティ) の更新 ---
    const srOnlyH1 = document.querySelector('h1.sr-only');
    if (srOnlyH1) {
        srOnlyH1.textContent = srOnlyH1.textContent
            .replace(festivalReg, fullName)
            .replace(themeReg, theme)
            .replace(univReg, univName);
    }

    // --- JSON-LD (構造化データ) の更新 ---
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (jsonLdScript) {
        try {
            let ld = JSON.parse(jsonLdScript.textContent);
            
            const updateLd = (obj) => {
                for (let key in obj) {
                    if (typeof obj[key] === 'string') {
                        // 特定のキーを config の値で上書き
                        if (key === 'startDate') obj[key] = config.dates.start;
                        else if (key === 'endDate') obj[key] = config.dates.end;
                        else if (key === 'email') obj[key] = config.contact.email;
                        else if (key === 'postalCode') obj[key] = config.address.postalCode.replace(/[^0-9-]/g, '');
                        else if (key === 'streetAddress') obj[key] = config.address.text;
                        else if (key === 'name' && (obj['@type'] === 'Place' || obj['@type'] === 'Organization')) {
                           if (obj['@type'] === 'Place') obj[key] = config.universityName;
                           else if (obj['@type'] === 'Organization') obj[key] = fullName + '実行委員会';
                        }
                        else {
                            // それ以外は文字列置換
                            obj[key] = obj[key]
                                .replace(festivalReg, fullName)
                                .replace(themeReg, theme)
                                .replace(dateReg, festivalDateText)
                                .replace(univReg, univName);
                        }
                    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        updateLd(obj[key]);
                    }
                }
            };
            updateLd(ld);

            // カノニカルな画像パスの修正
            if (ld.image && typeof ld.image === 'string') {
                ld.image = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/') + config.images.poster;
            }

            jsonLdScript.textContent = JSON.stringify(ld, null, 2);
        } catch (e) {
            console.warn('JSON-LD のパースに失敗しました:', e);
        }
    }

    // --- 本文内のプレースホルダー置換 ---
    const replaceTextInNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = node.nodeValue
                .replace(themeReg, theme)
                .replace(dateReg, festivalDateText)
                .replace(univReg, univName);
        } else {
            for (let child of node.childNodes) {
                if (child.nodeName !== 'SCRIPT' && child.nodeName !== 'STYLE') {
                    replaceTextInNode(child);
                }
            }
        }
    };
    replaceTextInNode(document.body);

    // --- ヘッダー・フッター等の個別要素更新 ---
    const headerGikadaisai = document.getElementById('gikadaisai');
    if (headerGikadaisai) headerGikadaisai.textContent = fullName;

    const footerGikadaisai = document.querySelector('.gikadaisai-footer');
    if (footerGikadaisai) footerGikadaisai.textContent = fullName;

    const footerAddress = document.querySelector('.footer-address');
    if (footerAddress) {
        footerAddress.innerHTML = config.address.postalCode + '<br>' + config.address.text;
    }

    const footerBottom = document.querySelector('.footer-bottom small');
    if (footerBottom) {
        footerBottom.innerHTML = 'Copyright&copy; ' + fullName + '実行委員会 All Rights Reserved.';
    }

    // SNS / 大学リンク
    const footerLinks = document.querySelectorAll('.footer-nav a');
    footerLinks.forEach(function (a) {
        const href = a.getAttribute('href');
        if (href && href.includes('x.com')) a.setAttribute('href', config.sns.x);
        else if (href && href.includes('instagram.com')) a.setAttribute('href', config.sns.instagram);
        else if (href && href.includes('tut.ac.jp') && a.textContent.includes('大学公式')) a.setAttribute('href', config.links.universityOfficial);
    });

    // --- グローバルに config を公開 ---
    window.siteConfig = config;
    document.dispatchEvent(new CustomEvent('siteConfigLoaded', { detail: config }));
})();
