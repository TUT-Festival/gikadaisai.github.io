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

    // --- 現在のページの公開状態を pageVisibility から判定 ---
    var pathname = window.location.pathname;
    var pageName = pathname.split('/').pop().replace(/\.html$/i, '') || 'index';
    var visibility = config.pageVisibility || {};
    var isPageVisible = visibility[pageName] !== false;

    // --- FOUC防止: プリレンダースクリーンを解除（常に実行） ---
    // page-visibility.js が非公開ページを「準備中」画面に差し替えるため、
    // body.site-ready は常に付与してプリレンダースクリーンを解除する
    document.body.classList.add('site-ready');

    // --- プリレンダースクリーンの祭名を更新（解除前に一瞬表示される場合に備える） ---
    var prerenderScreen = document.querySelector('.site-prerender-screen');
    if (prerenderScreen) {
        var prerenderDesc = prerenderScreen.querySelector('.prerender-desc');
        if (prerenderDesc) {
            prerenderDesc.innerHTML = fullName + 'の公式サイトです。<br>現在、サイトは準備中です。<br>公開までしばらくお待ちください。';
        }
    }

    // --- 正規表現 ---
    const festivalReg = /第(?:\d+|--|XX)回\s*技科大祭/g;
    const numOnlyReg = /第(?:\d+|--|XX)回/g;
    const themeReg = /{{THEME}}/g;
    const dateReg = /{{DATE}}/g;
    const univReg = /豊橋技術科学大学|{{UNIVERSITY}}/g;

    // --- <title> の更新 ---
    document.title = document.title
        .replace(festivalReg, fullName)
        .replace(numOnlyReg, '第' + num + '回')
        .replace(themeReg, theme)
        .replace(univReg, univName);

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

    // ページが公開状態の場合: description を本番テキストに直接上書き
    if (isPageVisible) {
        var publishedDesc = '豊橋技術科学大学の学園祭「' + fullName + '」公式サイト。今年のテーマは「' + theme + '」。ゲスト情報・タイムテーブル・模擬店情報を掲載。';
        var publishedDescShort = '豊橋技術科学大学の学園祭「' + fullName + '」公式サイト。今年のテーマは「' + theme + '」。';

        // ページ固有の description マッピング
        var descMap = {
            'index': publishedDesc,
            'access': fullName + 'の会場・アクセス情報。豊橋技術科学大学（愛知県豊橋市）へは豊橋駅より豊鉄バス技科大線で約25分。電車・バス・お車でのアクセス方法を案内します。',
            'contact': fullName + 'へのお問い合わせ・協賛に関するご相談はメールにてお受けしております。豊橋技術科学大学の学園祭実行委員会へお気軽にどうぞ。',
            'guest': fullName + 'のスペシャルゲストとお笑いライブ詳細。豊橋技術科学大学の学園祭ゲスト情報をご覧いただけます。',
            'proposal': '豊橋技術科学大学 開学50周年記念「' + fullName + '」へのご協賛・ご寄付のご案内。昨年の実績や今年の特別企画、開催概要をご覧いただけます。',
            'shops': fullName + 'の模擬店・キッチンカー全店舗一覧。屋内・屋外の出店情報を掲載。豊橋技術科学大学にて開催。',
            'support': fullName + 'へのご協賛・ご寄付のお願い。皆様からのご支援が学生主体の学園祭をより豊かなものにします。豊橋技術科学大学の学園祭。',
            'timetable': fullName + 'のタイムテーブル。ステージイベントの時間割を掲載しています。豊橋技術科学大学にて開催。'
        };
        var pageDesc = descMap[pageName] || publishedDesc;

        var ogDescMap = {
            'index': publishedDescShort,
            'access': fullName + 'の会場・アクセス情報。豊橋技術科学大学（愛知県豊橋市）へは豊橋駅より豊鉄バス技科大線で約25分。',
            'contact': fullName + 'へのお問い合わせ・協賛に関するご相談はメールにてお受けしております。',
            'guest': fullName + 'のスペシャルゲストとお笑いライブ詳細。豊橋技術科学大学にて開催。',
            'proposal': '豊橋技術科学大学 開学50周年記念「' + fullName + '」へのご協賛・ご寄付のご案内。',
            'shops': fullName + 'の模擬店・キッチンカー全店舗一覧。屋内・屋外の出店情報を掲載。',
            'support': fullName + 'へのご協賛・ご寄付のお願い。皆様からのご支援が学生主体の学園祭をより豊かなものにします。',
            'timetable': fullName + 'のタイムテーブル。豊橋技術科学大学にて開催。'
        };
        var ogDesc = ogDescMap[pageName] || publishedDescShort;

        metaUpdates.push(
            { selector: 'meta[name="description"]', attr: 'content', val: pageDesc, overwrite: true },
            { selector: 'meta[property="og:description"]', attr: 'content', val: ogDesc, overwrite: true },
            { selector: 'meta[name="twitter:description"]', attr: 'content', val: ogDesc, overwrite: true }
        );
    }

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
            .replace(numOnlyReg, '第' + num + '回')
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
                                .replace(numOnlyReg, '第' + num + '回')
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
                .replace(festivalReg, fullName)
                .replace(numOnlyReg, '第' + num + '回')
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

    // --- 協賛・寄付者の動的描画（共通処理） ---
    const sponsorGrid = document.getElementById('sponsor-grid');
    if (sponsorGrid) {
        try {
            const resSponsors = await fetch('js/sponsors.json');
            if (resSponsors.ok) {
                const sponsors = await resSponsors.json();
                const validSponsors = sponsors.filter(s => !s._memo);
                let htmlSponsors = '';
                if (validSponsors.length > 0) {
                    validSponsors.forEach(function(s) {
                        const href = s.url || '#';
                        const logo = s.img ? 'data/kyousan/' + s.img : 'data/kyousan/no.png';
                        const safeName = s.name ? String(s.name).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
                        htmlSponsors += '<a href="' + href + '" target="_blank" rel="noopener noreferrer" class="sponsor-tile">';
                        htmlSponsors += '<img src="' + logo + '" alt="' + safeName + ' ロゴ">';
                        htmlSponsors += '<span class="sponsor-name">' + safeName + '</span>';
                        htmlSponsors += '</a>';
                    });
                } else {
                    htmlSponsors = '<p class="c" style="width: 100%;">本年度のご協賛企業様を募集しております。</p>';
                }
                sponsorGrid.innerHTML = htmlSponsors;
            }
        } catch (error) {
            console.error(error);
            sponsorGrid.innerHTML = '<p class="c">協賛企業情報の読み込み中にエラーが発生しました。</p>';
        }
    }

    const supporterGrid = document.getElementById('supporter-grid');
    if (supporterGrid) {
        try {
            const resSupporters = await fetch('js/supporters.json');
            if (resSupporters.ok) {
                const supporters = await resSupporters.json();
                const validSupporters = supporters.filter(sp => !sp._memo);
                let htmlSupporters = '';
                if (validSupporters.length > 0) {
                    validSupporters.forEach(function(sp) {
                        const rawName = typeof sp === 'string' ? sp : sp.name;
                        const safeName = rawName ? String(rawName).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
                        if (safeName) {
                            htmlSupporters += '<div class="supporter-chip">' + safeName + '</div>';
                        }
                    });
                } else {
                    htmlSupporters = '<p class="c" style="width: 100%;">皆様からのご支援を引き続きお待ちしております。</p>';
                }
                supporterGrid.innerHTML = htmlSupporters;
            }
        } catch (error) {
            console.error(error);
            supporterGrid.innerHTML = '<p class="c">寄付者情報の読み込み中にエラーが発生しました。</p>';
        }
    }
})();
