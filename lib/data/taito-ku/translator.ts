import { csv2json } from '../csv2json'
import {
  validateTaitoKuClass,
  validateNumber,
  validateOptionalNumber,
  validateString,
  validateOptionalString,
  validateSource,
} from '../validator'
import { ClassList, Class, GeoLocation, Source } from '../../model/nursery-school'
import { MergedData } from '../../model/data'

const hoikuen: Source = {
  name: '台東区の保育施設の施設一覧',
  ver: '', // 不明。入所者最低指数に比べると古そう
  url: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131067d0000000037',
  filePath: __dirname + '/taito_childcare.csv',
}

const saiteiShisu: Source = {
  name: '令和３年４月_入園の第一次利用調整結果（入所下限合計指数一覧）',
  ver: '',
  url: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131067d0000000074',
  filePath: __dirname + '/R0304_nyuendaiichijiriyouchoseikekka.csv',
}

const taitoKu: MergedData = {
  localName: '台東区',
  dataList: [
    {
      filePath: hoikuen.filePath,
      filter: (record: any): boolean => {
        return true
      },
      mapping: [
        {
          tsModelKey: 'name',
          valueTranslator: (record: any): string => {
            return validateString(record['名称'])
          },
        },
        {
          tsModelKey: 'address',
          valueTranslator: (record: any): string => {
            return validateString(record['所在地'])
          },
        },
        {
          tsModelKey: 'location',
          valueTranslator: (record: any): GeoLocation => {
            const value: GeoLocation = {
              latitude: validateNumber(parseFloat(record['Y座標'])),
              longitude: validateNumber(parseFloat(record['X座標'])),
            }
            return value
          },
        },
        {
          tsModelKey: 'tel',
          valueTranslator: (record: any): string | null => {
            return validateOptionalString(record['電話番号'])
          },
        },
        {
          tsModelKey: 'url',
          valueTranslator: (record: any): string | null => {
            return validateOptionalString(record['WebサイトURL'])
          },
        },
        {
          tsModelKey: 'openYear',
          valueTranslator: (record: any): number | null => {
            return null // TODO
          },
        },
        {
          tsModelKey: 'openMonth',
          valueTranslator: (record: any): number | null => {
            return null // TODO
          },
        },
        {
          tsModelKey: 'sources',
          valueTranslator: (record: any): Source[] => {
            return [validateSource(hoikuen)]
          },
        },
      ],
    },
    {
      filePath: saiteiShisu.filePath,
      filter: (record: any): boolean => {
        if (record['園名'].length === 0) return false
        return true
      },
      mapping: [
        {
          tsModelKey: 'name',
          valueTranslator: (record: any): string => {
            return validateString(record['園名'])
          },
        },
        {
          tsModelKey: 'classList',
          valueTranslator: (record: any): ClassList => {
            const value: ClassList = {
              age0: validateTaitoKuClass(createClass(record['0歳'])),
              age1: validateTaitoKuClass(createClass(record['1歳'])),
              age2: validateTaitoKuClass(createClass(record['2歳'])),
              age3: validateTaitoKuClass(createClass(record['3歳'])),
              age4: validateTaitoKuClass(createClass(record['4歳'])),
              age5: validateTaitoKuClass(createClass(record['5歳'])),
              minimumIndexSource: validateSource(saiteiShisu),
            }
            return value
          },
        },
      ],
    },
  ],
}

const createClass = (minimumIndex: string): Class | null => {
  if (minimumIndex.length == 0) {
    // 定員がない（＝クラスがない）
    return null
  }
  if (minimumIndex == '―') {
    // クラスはあるが、募集がないため最低指数がない
    return { minimumIndex: null }
  }
  if (minimumIndex == '非公開') {
    // 内定者が1〜2名の場合、個人情報となるため非公開
    return { minimumIndex: minimumIndex }
  }
  if (minimumIndex == '空有') {
    // 一時調整後、空き有り。なぜ指数がないのかは確認中
    return { minimumIndex: minimumIndex }
  }
  return { minimumIndex: parseInt(minimumIndex) }
}

const taitoKuJsonFile = `${__dirname}/translated.json`
csv2json(taitoKu, taitoKuJsonFile)
