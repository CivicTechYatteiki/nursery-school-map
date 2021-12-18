## Setup
```
npm install
```

## Dev
```
npm run dev
```

## Deploy
ToDo

## 新しいデータの入稿
1. 公開されているCSVをlib/data配下におく
2. データ変換のtranslatorを書く
3. `npx ts-node --skip-project lib/data/minato-ku/translator.ts` のようにscriptを実行して、jsonを出力する