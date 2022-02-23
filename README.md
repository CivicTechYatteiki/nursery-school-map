# 入りやすい保育園マップ

https://hoikuen-hairu.vercel.app/

地図上に保育園を表示し、利用調整の最低指数が自治体内で高いか低いかに応じて色分け表示します。

オープンデータとして公開されている下記の情報を組み合わせて可視化しています。
- 自治体内の保育所の一覧
- 自治体内の入所者最低指数

現在は都内でオープンデータして上記の情報を公開している港区のみ対応しています。

都知事杯 OpenData Hackathon 出場プロジェクト

## Setup
```
npm install
```

## Dev
```
npm run dev
```

## Deploy
Vercelを利用中

## 新しいデータの入稿
1. 公開されているCSVをlib/data配下におく
2. データ変換のtranslatorを書く
3. `npx ts-node --skip-project lib/data/minato-ku/translator.ts` のようにscriptを実行して、jsonを出力する

# Contributing

IssueやPull Requestによるコントリビューションを受け付けています。
都内以外の地元自治体のオープンデータを供給するスクリプトを書いてくださる方など、welcomeです。
また、CSVやPDFではなくオープンデータとして情報公開してほしい旨を、
地元自治体にリクエストしていただける方がいましたらとてもありがたいです。
