/**
 * fireworks-intro.js
 *
 * index.html 専用の花火アニメーション。
 * HTML5 Canvas でリアルタイムに 5 フェーズの花火を描画し、
 * 終了後に CustomEvent 'fireworksComplete' を発行する。
 *
 * フェーズ:
 *   1. 上昇        (0-4 s)   — 1本の光の筋が上昇
 *   2. 赤い放射    (4-7 s)   — 放射状の赤白色花火
 *   3. 多色球体    (7-9 s)   — ピンク/青/黄/緑の球体爆発
 *   4. 金色しだれ  (9-14 s)  — 画面を覆う金色の柳
 *   5. 消退        (14-18 s) — フェードアウト → コンテンツ表示
 */
(function () {
    'use strict';

    /* ================================================================
     *  早期リターン: home ページ以外、または Canvas がなければ何もしない
     * ================================================================ */
    if (!document.body.classList.contains('home')) return;
    var canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var isMobile = window.innerWidth < 768;
    var PARTICLE_SCALE = isMobile ? 0.5 : 1;   // モバイル時パーティクル削減

    /* ---- Canvas リサイズ ---- */
    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ================================================================
     *  ユーティリティ
     * ================================================================ */
    function rand(min, max) { return Math.random() * (max - min) + min; }
    function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

    function hsl(h, s, l, a) {
        a = a === undefined ? 1 : a;
        return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
    }

    /* ================================================================
     *  Sound Engine (Web Audio API シンセ)
     * ================================================================ */
    var audioCtx = null;
    var soundEnabled = false;

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            soundEnabled = true;
        } catch (e) {
            soundEnabled = false;
        }
    }

    // ユーザー操作で AudioContext を初期化
    function tryInitAudio() {
        if (!audioCtx) initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }
    document.addEventListener('click', tryInitAudio, { once: true });
    document.addEventListener('touchstart', tryInitAudio, { once: true });

    function playRise() {
        if (!soundEnabled || !audioCtx) return;
        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 3.5);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 3);
            gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 4);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 4);
        } catch (e) {}
    }

    function playBoom(delay) {
        if (!soundEnabled || !audioCtx) return;
        try {
            var t = audioCtx.currentTime + (delay || 0);
            // 低音ドン
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.8);
            // ノイズ（破裂音）
            var bufferSize = audioCtx.sampleRate * 0.3;
            var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
            var noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            var ng = audioCtx.createGain();
            ng.gain.setValueAtTime(0.25, t);
            ng.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            noise.connect(ng).connect(audioCtx.destination);
            noise.start(t);
        } catch (e) {}
    }

    function playCrackle(delay) {
        if (!soundEnabled || !audioCtx) return;
        try {
            var t = audioCtx.currentTime + (delay || 0);
            var bufferSize = audioCtx.sampleRate * 1.5;
            var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = Math.random() > 0.97 ? (Math.random() * 2 - 1) * 0.5 : 0;
            }
            var src = audioCtx.createBufferSource();
            src.buffer = buffer;
            var g = audioCtx.createGain();
            g.gain.setValueAtTime(0.15, t);
            g.gain.linearRampToValueAtTime(0, t + 1.5);
            src.connect(g).connect(audioCtx.destination);
            src.start(t);
        } catch (e) {}
    }

    function playShimmer(delay) {
        if (!soundEnabled || !audioCtx) return;
        try {
            var t = audioCtx.currentTime + (delay || 0);
            var bufferSize = audioCtx.sampleRate * 4;
            var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            var data = buffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (bufferSize * 0.5));
            }
            var src = audioCtx.createBufferSource();
            src.buffer = buffer;
            var g = audioCtx.createGain();
            g.gain.setValueAtTime(0.2, t);
            g.gain.linearRampToValueAtTime(0, t + 4);
            var filter = audioCtx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            src.connect(filter).connect(g).connect(audioCtx.destination);
            src.start(t);
        } catch (e) {}
    }

    /* ================================================================
     *  Particle クラス
     * ================================================================ */
    function Particle(x, y, vx, vy, color, life, size, gravity, friction, fadeStyle) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;          // { h, s, l }
        this.life = life;
        this.maxLife = life;
        this.size = size || 2;
        this.gravity = gravity !== undefined ? gravity : 0.04;
        this.friction = friction || 0.99;
        this.fadeStyle = fadeStyle || 'alpha'; // 'alpha' | 'trail' | 'shrink'
        this.alpha = 1;
        this.trail = [];
        this.trailLength = fadeStyle === 'trail' ? 8 : 0;
    }

    Particle.prototype.update = function () {
        if (this.trailLength > 0) {
            this.trail.push({ x: this.x, y: this.y, a: this.alpha });
            if (this.trail.length > this.trailLength) this.trail.shift();
        }
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        var progress = 1 - this.life / this.maxLife;
        if (this.fadeStyle === 'alpha') {
            this.alpha = 1 - progress;
        } else if (this.fadeStyle === 'shrink') {
            this.alpha = 1 - progress * progress;
            this.size = Math.max(0.3, this.size * (1 - progress * 0.02));
        } else if (this.fadeStyle === 'trail') {
            this.alpha = Math.max(0, 1 - progress * 1.2);
        }
    };

    Particle.prototype.draw = function (ctx) {
        // トレイル
        if (this.trail.length > 1) {
            for (var i = 0; i < this.trail.length - 1; i++) {
                var t = this.trail[i];
                var ta = (i / this.trail.length) * this.alpha * 0.5;
                ctx.beginPath();
                ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2);
                ctx.fillStyle = hsl(this.color.h, this.color.s, this.color.l, ta);
                ctx.fill();
            }
        }
        // 本体
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = hsl(this.color.h, this.color.s, this.color.l, this.alpha);
        ctx.fill();
        // グロー
        if (this.size > 1.5 && this.alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fillStyle = hsl(this.color.h, this.color.s, Math.min(90, this.color.l + 20), this.alpha * 0.15);
            ctx.fill();
        }
    };

    Particle.prototype.isDead = function () {
        return this.life <= 0 || this.alpha <= 0.01;
    };

    /* ================================================================
     *  パーティクルプール
     * ================================================================ */
    var particles = [];

    function addParticle(p) { particles.push(p); }

    function spawnBurst(cx, cy, count, color, speed, life, size, gravity, friction, fadeStyle) {
        count = Math.floor(count * PARTICLE_SCALE);
        for (var i = 0; i < count; i++) {
            var angle = (Math.PI * 2 / count) * i + rand(-0.05, 0.05);
            var spd = speed * rand(0.8, 1.2);
            var c = { h: color.h + rand(-10, 10), s: color.s + rand(-5, 5), l: color.l + rand(-10, 10) };
            addParticle(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, c, life + randInt(-10, 10), size, gravity, friction, fadeStyle));
        }
    }

    function spawnSphereBurst(cx, cy, count, colors, speed, life, size) {
        count = Math.floor(count * PARTICLE_SCALE);
        for (var i = 0; i < count; i++) {
            var angle = rand(0, Math.PI * 2);
            var spd = speed * rand(0.3, 1);
            var c = colors[randInt(0, colors.length - 1)];
            c = { h: c.h + rand(-15, 15), s: c.s, l: c.l + rand(-5, 10) };
            addParticle(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, c, life + randInt(-15, 15), size * rand(0.7, 1.3), 0.035, 0.985, 'shrink'));
        }
    }

    function spawnWillow(cx, cy, count, life, speed) {
        count = Math.floor(count * PARTICLE_SCALE);
        for (var i = 0; i < count; i++) {
            var angle = rand(0, Math.PI * 2);
            var spd = speed * rand(0.4, 1.0);
            var h = rand(35, 50);
            var l = rand(50, 75);
            addParticle(new Particle(cx, cy, Math.cos(angle) * spd, Math.sin(angle) * spd, { h: h, s: 90, l: l }, life + randInt(-20, 20), rand(1.2, 2.5), 0.06, 0.975, 'trail'));
        }
    }

    /* ================================================================
     *  シーケンス管理
     * ================================================================ */
    var startTime = 0;
    var rocketY = 0;
    var rocketX = 0;
    var rocketStarted = false;
    var phase1Done = false;
    var phase2Done = false;
    var phase3Done = false;
    var phase4Done = false;
    var showComplete = false;
    var globalAlpha = 1;

    // 花火の中心点
    var burstCX, burstCY;

    function resetState() {
        particles = [];
        rocketStarted = false;
        phase1Done = false;
        phase2Done = false;
        phase3Done = false;
        phase4Done = false;
        showComplete = false;
        globalAlpha = 1;
        burstCX = W * 0.5;
        burstCY = H * 0.3;
        rocketX = W * 0.5;
        rocketY = H + 10;
    }

    /* ---- 上昇フェーズ (0-4s) ---- */
    function updateRocket(elapsed) {
        if (elapsed < 0.1 && !rocketStarted) {
            rocketStarted = true;
            rocketY = H + 10;
            playRise();
        }
        if (elapsed < 4 && rocketStarted && !phase1Done) {
            var progress = elapsed / 4;
            var eased = 1 - Math.pow(1 - progress, 3);
            rocketY = H - eased * (H * 0.7);
            // 上昇中のスパーク
            if (Math.random() < 0.6) {
                addParticle(new Particle(
                    rocketX + rand(-2, 2), rocketY + rand(5, 15),
                    rand(-0.5, 0.5), rand(1, 3),
                    { h: rand(30, 50), s: 100, l: rand(70, 90) },
                    randInt(10, 25), rand(1, 2.5), 0.08, 0.96, 'alpha'
                ));
            }
        }
    }

    function drawRocket(elapsed) {
        if (elapsed >= 4 || !rocketStarted || phase1Done) return;
        // ロケット本体（明るい点）
        ctx.beginPath();
        ctx.arc(rocketX, rocketY, 3, 0, Math.PI * 2);
        ctx.fillStyle = hsl(40, 100, 95, 1);
        ctx.fill();
        // グロー
        ctx.beginPath();
        ctx.arc(rocketX, rocketY, 12, 0, Math.PI * 2);
        ctx.fillStyle = hsl(40, 100, 80, 0.3);
        ctx.fill();
    }

    /* ---- 第1の開花: 放射状の赤 (4-7s) ---- */
    function triggerPhase2(elapsed) {
        if (phase1Done || elapsed < 4) return;
        phase1Done = true;
        burstCX = rocketX;
        burstCY = rocketY;
        playBoom(0);

        // 赤白の放射状
        spawnBurst(burstCX, burstCY, 200, { h: 350, s: 95, l: 65 }, 7, 90, 2.5, 0.04, 0.985, 'trail');
        // さらに小さな赤いスパーク
        spawnBurst(burstCX, burstCY, 80, { h: 10, s: 100, l: 80 }, 4, 60, 1.5, 0.03, 0.99, 'alpha');
        // 青緑の煙パーティクル
        spawnBurst(burstCX, burstCY, 40, { h: 170, s: 60, l: 40 }, 2, 120, 5, 0.01, 0.995, 'alpha');
    }

    /* ---- 万華鏡の開花: 多色球体 (7-9s) ---- */
    function triggerPhase3(elapsed) {
        if (phase2Done || elapsed < 7) return;
        phase2Done = true;
        playBoom(0);
        playCrackle(0.2);

        var colors = [
            { h: 330, s: 90, l: 65 },  // ピンク
            { h: 220, s: 90, l: 60 },  // 青
            { h: 55,  s: 95, l: 60 },  // 黄色
            { h: 140, s: 80, l: 55 },  // 緑
            { h: 280, s: 80, l: 65 },  // 紫
            { h: 15,  s: 95, l: 60 },  // オレンジ
        ];
        spawnSphereBurst(burstCX, burstCY, 400, colors, 5, 80, 2);
        // きらめき追加
        spawnSphereBurst(burstCX, burstCY, 100, [{ h: 0, s: 0, l: 95 }], 3, 40, 1.5);
    }

    /* ---- 金色のフィナーレ: しだれ (9-14s) ---- */
    function triggerPhase4(elapsed) {
        if (phase3Done || elapsed < 9) return;
        phase3Done = true;
        playBoom(0);
        playShimmer(0.3);

        spawnWillow(burstCX, burstCY, 800, 150, 8);
        // 追加の金色スパーク（密度を増す）
        spawnWillow(burstCX, burstCY, 300, 120, 6);
        // 白い閃光
        spawnBurst(burstCX, burstCY, 50, { h: 45, s: 50, l: 95 }, 3, 30, 3, 0.02, 0.99, 'alpha');
    }

    /* ---- 消退 (14-18s) ---- */
    function updateFadeout(elapsed) {
        if (elapsed < 14) return;
        if (elapsed >= 14 && !phase4Done) {
            phase4Done = true;
        }
        var fadeProgress = (elapsed - 14) / 4;
        globalAlpha = Math.max(0, 1 - fadeProgress);
        if (fadeProgress >= 1 && !showComplete) {
            completeShow();
        }
    }

    /* ================================================================
     *  メインループ
     * ================================================================ */
    var animId = null;
    var isRunning = false;

    function loop(timestamp) {
        if (!isRunning) return;
        animId = requestAnimationFrame(loop);

        var elapsed = (timestamp - startTime) / 1000;

        // 背景クリア
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // 遠景の星
        drawStars();

        ctx.globalAlpha = globalAlpha;

        // フェーズ制御
        updateRocket(elapsed);
        triggerPhase2(elapsed);
        triggerPhase3(elapsed);
        triggerPhase4(elapsed);
        updateFadeout(elapsed);

        // パーティクル更新 & 描画
        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.update();
            if (p.isDead()) {
                particles.splice(i, 1);
            } else {
                p.draw(ctx);
            }
        }

        // ロケット描画
        drawRocket(elapsed);

        // 下部の煙（グラデーション）
        drawSmoke(elapsed);

        // 観客のシルエット
        drawAudience(elapsed);

        ctx.globalAlpha = 1;
    }

    /* ---- 遠景の星 ---- */
    var stars = [];
    function initStars() {
        stars = [];
        for (var i = 0; i < 80; i++) {
            stars.push({
                x: rand(0, 1),
                y: rand(0, 0.6),
                size: rand(0.5, 1.5),
                twinkle: rand(0, Math.PI * 2)
            });
        }
    }
    initStars();

    function drawStars() {
        var t = Date.now() / 1000;
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            var a = 0.3 + 0.3 * Math.sin(t * 1.5 + s.twinkle);
            ctx.beginPath();
            ctx.arc(s.x * W, s.y * H, s.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,' + (a * globalAlpha) + ')';
            ctx.fill();
        }
    }

    /* ---- 煙 ---- */
    function drawSmoke(elapsed) {
        if (elapsed < 4) return;
        var smokeAlpha = Math.min(0.4, (elapsed - 4) / 6);
        // フェーズ4以降で金色に
        var smokeH = elapsed >= 9 ? 40 : 200;
        var smokeL = elapsed >= 9 ? 30 : 15;
        smokeAlpha *= globalAlpha;

        var grad = ctx.createLinearGradient(0, H * 0.75, 0, H);
        grad.addColorStop(0, 'hsla(' + smokeH + ',30%,' + smokeL + '%,0)');
        grad.addColorStop(1, 'hsla(' + smokeH + ',30%,' + smokeL + '%,' + smokeAlpha + ')');
        ctx.fillStyle = grad;
        ctx.fillRect(0, H * 0.6, W, H * 0.4);
    }

    /* ---- 観客のシルエット ---- */
    function drawAudience(elapsed) {
        if (elapsed < 0.5) return;
        var silAlpha = Math.min(0.3, elapsed / 10) * globalAlpha;
        ctx.fillStyle = 'rgba(0,0,0,' + (1 - silAlpha * 0.3) + ')';

        // シンプルなシルエット群（下部）
        var baseY = H - 10;
        ctx.fillStyle = 'rgba(15,10,20,' + Math.min(0.9, silAlpha * 3) + ')';
        for (var i = 0; i < 15; i++) {
            var sx = W * (i / 14) - 10 + Math.sin(i * 2.7) * 20;
            var headR = rand(6, 10);
            var bodyH = rand(15, 25);
            ctx.beginPath();
            ctx.arc(sx, baseY - bodyH - headR, headR, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(sx - headR * 0.8, baseY - bodyH, headR * 1.6, bodyH);
        }
    }

    /* ================================================================
     *  完了処理
     * ================================================================ */
    function completeShow() {
        if (showComplete) return;
        showComplete = true;
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);

        // プリレンダースクリーンをフェードアウト
        var screen = document.querySelector('.site-prerender-screen');
        if (screen) {
            screen.classList.add('fireworks-fadeout');
        }

        // フェードアウト後に fireworksComplete を発行
        setTimeout(function () {
            document.dispatchEvent(new CustomEvent('fireworksComplete'));
            // セッションストレージに記録
            try { sessionStorage.setItem('fireworks_seen', '1'); } catch (e) {}
        }, 1600);
    }

    function skipShow() {
        if (showComplete) return;
        isRunning = false;
        if (animId) cancelAnimationFrame(animId);
        showComplete = true;

        var screen = document.querySelector('.site-prerender-screen');
        if (screen) {
            screen.classList.add('fireworks-fadeout');
        }
        setTimeout(function () {
            document.dispatchEvent(new CustomEvent('fireworksComplete'));
            try { sessionStorage.setItem('fireworks_seen', '1'); } catch (e) {}
        }, 1600);
    }

    /* ================================================================
     *  初期化
     * ================================================================ */
    function start() {
        // セッションストレージで既に見た場合はスキップ
        try {
            if (sessionStorage.getItem('fireworks_seen') === '1') {
                // 即座に完了
                document.dispatchEvent(new CustomEvent('fireworksComplete'));
                var screen = document.querySelector('.site-prerender-screen');
                if (screen) screen.style.display = 'none';
                return;
            }
        } catch (e) {}

        resetState();
        isRunning = true;
        startTime = performance.now();
        animId = requestAnimationFrame(loop);

        // Skip ボタン
        var skipBtn = document.getElementById('fireworks-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                skipShow();
            });
        }

        // 画面クリックでもスキップ
        canvas.addEventListener('click', function () {
            skipShow();
        });
    }

    // DOMContentLoaded で開始
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
