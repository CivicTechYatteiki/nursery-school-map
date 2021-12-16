import fs from 'fs'
import { parse } from 'csv-parse'

interface Data {
  fileName: string
  mapping: Mapping[]
}

interface Mapping {
  columnName: string // ex) 保育園名, 0歳
  tsModelKey: string // ex) name, classList.age0.minimumIndex
  //valueTranslator: Function | null
}

interface MergedData {
  data: Data[]
  tsModelKeyForMerge: string // どのキーをもとにマージするか
}

// const classTranslator = (minimumIndexRawValue: string): Class | null => {
//   if (minimumIndexRawValue == "―") {
//     // クラスはあるが、空きがない・希望者がいないため最低指数がない
//     return {
//       minimumIndex: null
//     }
//   } else if (minimumIndexRawValue == "") {
//     // 定員がない（＝クラスがない）
//     return null
//   } else if (minimumIndexRawValue.match(/(\d+)以下/)) {
//     const result = minimumIndexRawValue.match(/(\d+)以下/)
//     return {
//       minimumIndex: {
//         lessThanOrEqual: parseInt(result[1]),
//         text: minimumIndexRawValue
//       }
//     }
//   } else {
//     return {
//       minimumIndex: parseInt(minimumIndexRawValue)
//     }
//   }
// }

const minatoKu: MergedData = {
  data: [
    {
      fileName: "minato-ku/hoikuen.csv",
      mapping: [
        {
          columnName: "施設種別",
          tsModelKey: "institutionType"
        },
        {
          columnName: "地区",
          tsModelKey: "area"
        },
        {
          columnName: "保育園名",
          tsModelKey: "name"
        },
        {
          columnName: "所在地",
          tsModelKey: "address"
        },
        {
          columnName: "緯度",
          tsModelKey: "location.latitude"
        },
        {
          columnName: "経度",
          tsModelKey: "location.longitude"
        },
        {
          columnName: "種別",
          tsModelKey: "ownerType"
        },
        {
          columnName: "電話番号",
          tsModelKey: "tel"
        },
        {
          columnName: "入園可能月齢",
          tsModelKey: "admissionAgeInMonth"
        },
      ]
    },
    // {
    //   fileName: "hoikuen_saiteishisu.csv",
    //   mapping: [
    //     {
    //       columnName: "保育園名",
    //       tsModelKey: "name"
    //     },
    //     {
    //       columnName: "0歳",
    //       tsModelKey: "classList.age0"
    //     },
    //     {
    //       columnName: "1歳",
    //       tsModelKey: "classList.age1"
    //     },
    //     {
    //       columnName: "2歳",
    //       tsModelKey: "classList.age2"
    //     },
    //     {
    //       columnName: "3歳",
    //       tsModelKey: "classList.age3"
    //     },
    //     {
    //       columnName: "4歳",
    //       tsModelKey: "classList.age4"
    //     },
    //     {
    //       columnName: "5歳",
    //       tsModelKey: "classList.age5"
    //     },
    //   ]
    // },
  ],
  tsModelKeyForMerge: "name"
}


export interface NurserySchool {
  name: string
  address: string
  area: string // 地区。赤坂、高輪など
  tel: string
  institutionType: string // 施設種別。認可保育園、小規模保育事業など
  ownerType: string // 種別。私立、区立など
  location: GeoLocation
  admissionAgeInMonth: string // 入園可能月齢。3ヶ月、57日など
  classList: ClassList | null
  source: [Source] // 情報元
}

interface GeoLocation {
  latitude: number // 緯度
  longitude: number // 経度
}

interface ClassList {
  age0: Class | null // 受け入れ枠がない場合はnull
  age1: Class | null
  age2: Class | null
  age3: Class | null
  age4: Class | null
  age5: Class | null
  //capacitySource: Source
  minimumIndexSource: Source
}

interface Class {
  //capacity: number // 定員
  minimumIndex: MinimumIndex | null // 入所最低指数。空きがない、希望者がいない場合はnull
}

type MinimumIndex = number | Range | '非公開'

interface Range {
  lessThanOrEqual: number // 22
  text: string // 22以下
}

interface Source {
  name: string // 令和3年4月入所1次利用調整における入所者最低指数
  ver: string // Ver202104
  url: string 
}

const ex1: NurserySchool = {
  name: "芝公園保育園",
  address: "東京都港区芝公園二丁目7番3号",
  area: "芝",
  tel: "03-3438-0435",
  institutionType: "認可保育園",
  ownerType: "区立",
  location: {
    latitude: 35.654291,
    longitude: 139.750533,
  },
  admissionAgeInMonth: "57日",
  classList: {
    age0: { minimumIndex: 40 },
    age1: { minimumIndex: 41 },
    age2: { minimumIndex: 40 },
    age3: { minimumIndex: 38 },
    age4: null,
    age5: { minimumIndex: { lessThanOrEqual: 22, text: '22以下' } },
    minimumIndexSource: {
      name: "令和3年4月入所1次利用調整における入所者最低指数",
      ver: "Ver202104",
      url: "https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000001/resource/e81871d0-1d09-453b-b492-2321e3335e26"
    }
  },
  source: [
    {
      name: "港区内認可保育園等一覧",
      ver: "Ver202104",
      url: "https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000001/resource/a208f801-ce87-4fb9-96d0-ba38813ea330"
    }
  ]
}



const csv2json = (data: Data) => {
  const csv = fs.readFileSync(__dirname + "/data/" + data.fileName)
  parse(csv, {columns: true, skipEmptyLines: true}, (error, records) => {
    console.log(error)
    console.log(records)
  })
}

csv2json(minatoKu.data[0])