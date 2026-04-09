# 技科大祭ホームページ 更新マニュアル

このドキュメントは、技科大祭ホームページを来年度以降に引き継ぎ・更新するための手順書です。

---

## 目次

1. [ファイル構成の概要](#1-ファイル構成の概要)
2. [毎年必ず更新するもの（チェックリスト）](#2-毎年必ず更新するものチェックリスト)
3. [各JSONファイルの編集方法](#3-各jsonファイルの編集方法)
4. [画像ファイルの差し替え](#4-画像ファイルの差し替え)
5. [JSONの書き方の注意点](#5-jsonの書き方の注意点)
6. [ローカルでの動作確認方法](#6-ローカルでの動作確認方法)
7. [よくあるエラーと対処法](#7-よくあるエラーと対処法)

---

## 1. ファイル構成の概要

```
gikadaisai/
├── index.html          ← トップページ（HTML構造のみ、通常は編集不要）
├── events.html         ← イベントページ
├── shops.html          ← 模擬店・キッチンカー
├── timetable.html      ← タイムテーブル
├── access.html         ← アクセス情報
├── outline.html        ← 協賛企業
├── contact.html        ← お問い合わせ
│
├── js/
│   ├── site-config.json    ★ サイト全体の設定（回数・日程・テーマ等）
│   ├── events.json         ★ イベント情報
│   ├── sponsors.json       ★ 協賛企業情報
│   ├── shop.json           ★ 模擬店・キッチンカー情報
│   ├── timetable.json      ★ バス時刻表
│   ├── site-loader.js      ← 共通読み込みスクリプト（編集不要）
│   ├── festival-countdown.js ← カウントダウン（編集不要）
│   ├── bus-countdown.js    ← バスカウントダウン（編集不要）
│   └── main.js             ← メインスクリプト（編集不要）
│
├── css/
│   └── style.css           ← スタイルシート（デザイン変更時のみ）
│
├── data/
│   ├── poster.png          ★ テーマポスター画像
│   ├── poster_live.png     ★ イベントポスター画像
│   ├── timetable.png       ★ タイムテーブル画像
│   ├── kyousan/            ★ 協賛企業ロゴ
│   ├── map/                ★ 会場マップ画像
│   └── shop/icon/          ★ 模擬店アイコン画像
│
└── images/
    └── HP_icon.png         ← ファビコン
```

**★ マークのファイルが毎年更新対象です。**
HTMLファイルやJSファイルは原則として編集不要です。

---

## 2. 毎年必ず更新するもの（チェックリスト）

以下を上から順に対応してください。

- [ ] `js/site-config.json` — 回数・日程・テーマ・メールアドレス等
- [ ] `js/shop.json` — 模擬店・キッチンカーのデータ
- [ ] `js/events.json` — イベント情報（ゲスト名・日時等）
- [ ] `js/sponsors.json` — 協賛企業の情報
- [ ] `js/timetable.json` — バス時刻表（変更がある場合のみ）
- [ ] `data/poster.png` — テーマポスター画像の差し替え
- [ ] `data/poster_live.png` — イベントポスター画像の差し替え
- [ ] `data/timetable.png` — タイムテーブル画像の差し替え
- [ ] `data/map/` — 会場マップ画像の差し替え（inside.png, outside.png）
- [ ] `data/shop/icon/` — 模擬店アイコン画像の差し替え
- [ ] `data/kyousan/` — 協賛企業ロゴ画像の差し替え

---

## 3. 各JSONファイルの編集方法

### 3-1. site-config.json（最重要）

**このファイルを更新するだけで、全ページの回数・日程・テーマ等が自動で切り替わります。**

```json
{
    "festivalNumber": 49,            ← 開催回数を変更（例：48 → 49）
    "festivalName": "技科大祭",       ← 基本変更不要
    "universityName": "豊橋技術科学大学", ← 基本変更不要
    "theme": "新しいテーマ",           ← 今年のテーマに変更

    "dates": {
        "day1": "2026-10-10T10:00:00",     ← 1日目の日時（開場時刻込み）
        "day2": "2026-10-11",               ← 2日目の日付
        "displayText": "10月10日(土)・11日(日)"  ← 表示用テキスト
    },

    "contact": {
        "email": "tut.festival@gmail.com"   ← 連絡先メール
    },

    "sns": {
        "x": "https://x.com/tut_festival",              ← X(Twitter)のURL
        "instagram": "https://www.instagram.com/tut_festival/"  ← InstagramのURL
    },

    "images": {
        "poster": "data/poster.png",         ← ポスター画像パス
        "posterLive": "data/poster_live.png", ← イベントポスター画像パス
        "timetable": "data/timetable.png"    ← タイムテーブル画像パス
    }
}
```

**日付の書き方**: `"2026-10-10T10:00:00"` の形式で記入します。`T`の左が日付、右が開場時刻です。

### 3-2. shop.json（模擬店情報）

配列の中にオブジェクトを並べます。各店舗に1つのオブジェクトです。

```json
[
    {
        "id": "1",               ← 一意のID（一覧の表示順序に使用）
        "circle": "サークル名",    ← 団体名
        "title": "店名",          ← 店舗名
        "place": "室内",          ← "室内" または "屋外"
        "location": "A-114/22",  ← 場所コード
        "img": "1.png"           ← アイコン画像ファイル名（拡張子を含む）
    },
    {
        "id": "2",
        "circle": "別のサークル",
        "title": "別の店名",
        "place": "屋外",
        "location": "テント5",
        "img": "2.png"
    }
]
```

**ポイント**:
- `id` は一覧の表示順序を決定するためのキーです
- `img` の値がそのまま `data/shop/icon/{img}` の画像ファイル名になります（拡張子を含めて指定）
- `img` が未指定の場合、デフォルト画像 `data/shop/icon/default.png` が表示されます
- キッチンカーは `id` にアルファベット（A, B, C...）を使用しています
- `place` は `"室内"` か `"屋外"` のいずれかを指定してください

### 3-3. events.json（イベント情報）

```json
[
    {
        "id": "comedy-live",
        "title": "スペシャルお笑いライブ",
        "date": "10/12(日)",
        "startTime": "11:30",
        "description": "ゲスト名やイベント説明。\n改行は \\n で記述。",
        "poster": "data/poster_live.png",
        "freeAdmission": true,
        "cautions": [
            "注意事項1",
            "注意事項2"
        ],
        "otherNotes": [
            "その他の注意1"
        ],
        "warningText": "警告文。\n複数行は \\n で。",
        "closingText": "締めの一文。"
    }
]
```

**ポイント**:
- イベントが複数ある場合は、配列の中にオブジェクトを追加してください
- `\n` で改行ができます

### 3-4. sponsors.json（協賛企業）

```json
[
    {
        "name": "企業名",
        "url": "https://example.com",   ← 企業サイトURL（なければ空文字 ""）
        "img": "logo.png"                ← ロゴ画像ファイル名（拡張子を含む、data/kyousan/ 内に配置）
    }
]
```

**ポイント**:
- URLがない企業は `"url": ""` と空文字にしてください（`#` リンクになります）
- ロゴがない企業は `"img": null` としてください（デフォルト画像 `data/kyousan/no.png` が表示されます）
- `img` にはファイル名のみ指定します（例: `"himika.png"`）。ディレクトリパスは不要です

### 3-5. timetable.json（バス時刻表）

```json
{
    "weekday": ["07:05", "07:10", "07:30", ...],
    "saturday": ["07:05", "07:30", "07:55", ...],
    "sunday": ["07:05", "07:30", "07:55", ...]
}
```

**ポイント**:
- 時刻は `"HH:MM"` 形式（24時間表記）で記入
- 時刻は必ず**昇順（早い順）**に並べてください
- バス会社のダイヤ改正があった場合のみ更新が必要です

---

## 4. 画像ファイルの差し替え

画像を差し替える場合、**同じファイル名で上書き**すれば、HTMLやJSONの変更は不要です。

| 画像 | パス | 推奨事項 |
|------|------|----------|
| テーマポスター | `data/poster.png` | できるだけ軽量化（1MB以下推奨） |
| イベントポスター | `data/poster_live.png` | 同上 |
| タイムテーブル | `data/timetable.png` | 同上 |
| 屋外マップ | `data/map/outside.png` | - |
| 屋内マップ | `data/map/inside.png` | - |
| 協賛企業ロゴ | `data/kyousan/*.png` | sponsors.json の `img` と一致させる |
| 模擬店アイコン | `data/shop/icon/{img}` | shop.json の `img` と一致させる |

**ファイル名を変更した場合**は、対応する JSON ファイルのパスも更新してください。

---

## 5. JSONの書き方の注意点

JSONは書き方を少しでも間違えるとエラーになります。以下の点に注意してください。

### よくあるミス

| ミス | 誤 | 正 |
|------|-----|-----|
| 最後のカンマ | `"name": "A",` `}` | `"name": "A"` `}` |
| シングルクォート | `'hello'` | `"hello"` |
| コメント | `// コメント` | ← JSONではコメント不可 |
| 全角文字の混入 | `"name"："A"` | `"name": "A"` |

### チェック方法

1. [JSONLint](https://jsonlint.com/) にJSONの中身をコピペして「Validate JSON」を押すとエラーチェックできます
2. VS Code を使っている場合、JSONファイルを開くと自動でエラー箇所が赤線で表示されます

---

## 6. ローカルでの動作確認方法

JSONファイルを `fetch()` で読み込むため、**HTMLファイルを直接ブラウザで開く（file:// プロトコル）と動作しません**。ローカルサーバーを起動する必要があります。

### 方法1: VS Code の Live Server（推奨）

1. VS Code に「Live Server」拡張機能をインストール
2. `index.html` を右クリック → 「Open with Live Server」
3. ブラウザが自動で開き、サイトが表示されます

### 方法2: Python の簡易サーバー

ターミナルで以下を実行：

```bash
# gikadaisai フォルダに移動
cd gikadaisai

# Python 3 の場合
python3 -m http.server 8000

# Python 2 の場合
python -m SimpleHTTPServer 8000
```

ブラウザで `http://localhost:8000` にアクセスしてください。

### 方法3: Node.js の簡易サーバー

```bash
npx serve .
```

---

## 7. よくあるエラーと対処法

### 「ページが真っ白になった」「テキストが表示されない」

**原因**: JSONファイルの文法エラーの可能性が高いです。

**対処法**:
1. ブラウザの開発者ツール（F12）→ コンソールタブを確認
2. エラーメッセージに記載されたJSONファイルを確認
3. [JSONLint](https://jsonlint.com/) でチェック

### 「模擬店のアイコンが表示されない」

**原因**: `shop.json` の `id` と画像ファイル名が一致していません。

**対処法**:
- `shop.json` で `"img": "5.png"` なら、画像は `data/shop/icon/5.png` が必要です
- `img` が未指定の場合、デフォルト画像 `data/shop/icon/default.png` が表示されます

### 「カウントダウンが 00:00:00 のまま」

**原因**: `site-config.json` の日付形式が間違っている可能性があります。

**対処法**:
- `"day1": "2026-10-10T10:00:00"` のように `T` 区切りで記述してください
- 年・月・日の値が正しいか確認してください

### 「ヘッダーやフッターの回数が更新されない」

**原因**: `site-config.json` の `festivalNumber` が更新されていません。

**対処法**:
- `"festivalNumber": 49` のように数値（クォーテーションなし）で記入してください

### 「協賛企業が表示されない」

**原因**: `sponsors.json` の文法エラー、または画像パスのミスです。

**対処法**:
1. `sponsors.json` を JSONLint でチェック
2. `logo` のパスに記載した画像が実際に存在するか確認

---

## 付録: 年次更新の流れまとめ

```
1. js/site-config.json を開く
   → festivalNumber, theme, dates を来年度の値に書き換え

2. js/shop.json を開く
   → 模擬店データをすべて来年度のものに差し替え
   → data/shop/icon/ にアイコン画像を配置

3. js/events.json を開く
   → ゲスト名・日時・説明文を来年度のものに書き換え

4. js/sponsors.json を開く
   → 協賛企業を来年度のものに差し替え
   → data/kyousan/ にロゴ画像を配置

5. js/timetable.json を確認
   → バスダイヤに変更があれば更新

6. data/ フォルダの画像を差し替え
   → poster.png, poster_live.png, timetable.png, map/

7. ローカルサーバーで動作確認

8. デプロイ
```

**HTMLファイルの編集は原則不要です。**
