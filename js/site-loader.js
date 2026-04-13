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

    // --- ヘッダーの更新 ---
    const headerGikadaisai = document.getElementById('gikadaisai');
    if (headerGikadaisai) headerGikadaisai.textContent = fullName;

    // --- フッターの動的生成 ---
    const footerEl = document.querySelector('footer');
    if (footerEl) {
        // Menu ナビゲーション
        const menuItems = (config.footerNav || []).map(function (item) {
            return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
        }).join('\n\t\t\t\t');

        // Links（外部リンク）
        const linkItems = (config.footerLinks || []).map(function (item) {
            return '<li><a href="' + item.href + '" target="_blank" rel="noopener noreferrer">' + item.label + '</a></li>';
        }).join('\n\t\t\t\t');

        footerEl.innerHTML =
            '<div class="footer-container">\n' +
            '\t\t<div class="footer-col">\n' +
            '\t\t\t<div class="logo-footer">\n' +
            '\t\t\t\t<a href="index.html">\n' +
            '\t\t\t\t\t<span class="daigaku-footer">' + univName + '</span>\n' +
            '\t\t\t\t\t<span class="gikadaisai-footer">' + fullName + '</span>\n' +
            '\t\t\t\t</a>\n' +
            '\t\t\t</div>\n' +
            '\t\t\t<address class="footer-address">\n' +
            '\t\t\t\t' + config.address.postalCode + '<br>\n' +
            '\t\t\t\t' + config.address.text + '\n' +
            '\t\t\t</address>\n' +
            '\t\t</div>\n' +
            '\t\t<div class="footer-col">\n' +
            '\t\t\t<h4>Menu</h4>\n' +
            '\t\t\t<ul class="footer-nav">\n' +
            '\t\t\t\t' + menuItems + '\n' +
            '\t\t\t</ul>\n' +
            '\t\t</div>\n' +
            '\t\t<div class="footer-col">\n' +
            '\t\t\t<h4>Links</h4>\n' +
            '\t\t\t<ul class="footer-nav">\n' +
            '\t\t\t\t' + linkItems + '\n' +
            '\t\t\t</ul>\n' +
            '\t\t</div>\n' +
            '\t</div>\n' +
            '\t<div class="footer-bottom">\n' +
            '\t\t<small>Copyright&copy; ' + fullName + '実行委員会 All Rights Reserved.</small>\n' +
            '\t</div>';
    }

    // --- グローバルに config を公開 ---
    window.siteConfig = config;
    document.dispatchEvent(new CustomEvent('siteConfigLoaded', { detail: config }));
})();
