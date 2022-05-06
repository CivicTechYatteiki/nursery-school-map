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

Vercel を利用中

## 新しいデータの入稿

1. 公開されている CSV を lib/data 配下におく
2. データ変換の translator を書く
3. `npx ts-node --skip-project lib/data/minato-ku/translator.ts` のように script を実行して、json を出力する
4. `nursery-school-list.ts`の`getAllNurserySchoolListSets`に新しいデータを追加する

# Contributing

Issue や Pull Request によるコントリビューションを受け付けています。
都内以外の地元自治体のオープンデータを供給するスクリプトを書いてくださる方など、welcome です。
また、CSV や PDF ではなくオープンデータとして情報公開してほしい旨を、
地元自治体にリクエストしていただける方がいましたらとてもありがたいです。
