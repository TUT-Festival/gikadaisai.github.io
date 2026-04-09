//===============================================================
// debounce関数
//===============================================================
function debounce(func, wait) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            func.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


//===============================================================
// メニュー関連 (再デザイン版)
//===============================================================
$(function() {
    // 画面サイズに応じてPC用・モバイル用のクラスを切り替える関数
    var switchScreen = function() {
        var width = $(window).width();
        var breakpoint = 899; // モバイルとPC表示を切り替えるブレークポイント

        if (width <= breakpoint) {
            $('body').removeClass('large-screen').addClass('small-screen');
        } else {
            $('body').removeClass('small-screen').addClass('large-screen');
            // PC表示に切り替えた際に、モバイル用メニューが開いていれば閉じる
            $('#menubar').removeClass('is-open');
            $('#menubar_hdr').removeClass('ham');
        }
    };

    // ページ読み込み時に実行
    switchScreen();

    // ウィンドウリサイズ時に実行
    var resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            switchScreen();
        }, 100);
    });

    // ハンバーガーメニューのクリックイベント
    $('#menubar_hdr').on('click', function(e) {
        e.stopPropagation();
        $(this).toggleClass('ham');
        $('#menubar').toggleClass('is-open');
    });

    // ドロップダウン外クリックで閉じる
    $(document).on('click', function(e) {
        if ($('#menubar').hasClass('is-open') && !$(e.target).closest('header').length) {
            $('#menubar').removeClass('is-open');
            $('#menubar_hdr').removeClass('ham');
        }
    });

    // モバイル用のドロップダウンメニュー
    $('.small-screen .ddmenu_parent > a').on('click', function(e) {
        // href="#" の場合のみドロップダウンを開閉
        if ($(this).attr('href') === '#') {
            e.preventDefault(); // リンクの遷移を無効化
            $(this).next('ul').slideToggle('fast');
            $(this).toggleClass('is-active');
        }
    });

    // PC用のドロップダウンはCSSのvisibility/opacityトランジションで制御

});


//===============================================================
// スムーススクロール（※バージョン2024-1）※ヘッダーの高さとマージンを取得する場合
//===============================================================
$(function() {
    var headerHeight = $('header').outerHeight();
    var headerMargin = parseInt($('header').css("margin-top"));
    var totalHeaderHeight = headerHeight + headerMargin;
    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top - totalHeaderHeight;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if(window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 10);
    }
});


//===============================================================
// 汎用開閉処理
//===============================================================
$(function() {
	$('.openclose-parts').next().hide();
	$('.openclose-parts').click(function() {
		$(this).next().slideToggle();
		$('.openclose-parts').not(this).next().slideUp();
	});
});


//===============================================================
// テキストのフェードイン効果
//===============================================================
$(function() {
    $('.fade-in-text').on('inview', function(event, isInView) {
        // この要素が既にアニメーションされたかどうかを確認
        if (isInView && !$(this).data('animated')) {
            // アニメーションがまだ実行されていない場合
            let innerHTML = '';
            const text = $(this).text();
            $(this).text('');

            for (let i = 0; i < text.length; i++) {
                innerHTML += `<span class="char" style="animation-delay: ${i * 0.2}s;">${text[i]}</span>`;
            }

            $(this).html(innerHTML).css('visibility', 'visible');
            // アニメーションが実行されたことをマーク
            $(this).data('animated', true);
        }
    });
});


//===============================================================
// 詳細ページのサムネイル切り替え
//===============================================================
$(function() {
    // 初期表示: 各 .thumbnail-view に対して、直後の .thumbnail の最初の画像を表示
    $(".thumbnail-view-parts").each(function() {
        var firstThumbnailSrc = $(this).next(".thumbnail-parts").find("img:first").attr("src");
        var defaultImage = $("<img>").attr("src", firstThumbnailSrc);
        $(this).append(defaultImage);
    });

    // サムネイルがクリックされたときの動作
    $(".thumbnail-parts img").click(function() {
        var imgSrc = $(this).attr("src");
        var newImage = $("<img>").attr("src", imgSrc).hide();

        // このサムネイルの直前の .thumbnail-view 要素を取得
        var targetPhoto = $(this).parent(".thumbnail-parts").prev(".thumbnail-view-parts");

        targetPhoto.find("img").fadeOut(400, function() {
            targetPhoto.empty().append(newImage);
            newImage.fadeIn(400);
        });
    });
});


//===============================================================
// スライドショー
//===============================================================
$(function() {
	var slides = $('#mainimg .slide');
	var slideCount = slides.length;
	var currentIndex = 0;

	slides.eq(currentIndex).css('opacity', 1).addClass('active');

	setInterval(function() {
		var nextIndex = (currentIndex + 1) % slideCount;
		slides.eq(currentIndex).css('opacity', 0).removeClass('active');
		slides.eq(nextIndex).css('opacity', 1).addClass('active');
		currentIndex = nextIndex;
	}, 4000); // 4秒ごとにスライドを切り替える
});

