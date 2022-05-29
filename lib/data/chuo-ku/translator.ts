import { csv2json } from '../csv2json'
import { validateChuoKuClass, validateNumber, validateString, validateSource } from '../validator'
import { ClassList, Class, GeoLocation, Source } from '../../model/nursery-school'
import { MergedData } from '../../model/data'

// PDFをCSVに手動変換したものの提供をうけ、利用
const hoikuen: Source = {
  name: '認可保育所　施設案内',
  ver: '',
  url: 'https://www.city.chuo.lg.jp/kosodate/hoiku/ninkahoiku/ninkahoikuensisetuannai/index.html',
  filePath: __dirname + '/en_jyouhou.csv',
}

// PDFをCSVに手動変換したものの提供をうけ、利用
const saiteiShisu: Source = {
  name: '令和4年4月（第1回）利用調整結果',
  ver: '',
  url: 'https://www.city.chuo.lg.jp/kosodate/hoiku/ninkahoiku/sinki.html#cms643C3',
  filePath: __dirname + '/saiteishisu.csv',
}

const data: MergedData = {
  localName: '中央区',
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
            return validateString(record['住所'])
          },
        },
        {
          tsModelKey: 'location',
          valueTranslator: (record: any): GeoLocation => {
            const value: GeoLocation = {
              latitude: validateNumber(parseFloat(record['緯度'])),
              longitude: validateNumber(parseFloat(record['経度'])),
            }
            return value
          },
        },
        {
          tsModelKey: 'tel',
          valueTranslator: (record: any): string | null => {
            return null
          },
        },
        {
          tsModelKey: 'url',
          valueTranslator: (record: any): string | null => {
            return null
          },
        },
        {
          tsModelKey: 'openYear',
          valueTranslator: (record: any): number | null => {
            return null
          },
        },
        {
          tsModelKey: 'openMonth',
          valueTranslator: (record: any): number | null => {
            return null
          },
        },
        {
          tsModelKey: 'ownerType',
          valueTranslator: (record: any): string => {
            return validateString(record['種別'])
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
        if (record['保育施設'].length === 0) return false
        return true
      },
      mapping: [
        {
          tsModelKey: 'name',
          valueTranslator: (record: any): string => {
            return validateString(record['保育施設'])
          },
        },
        {
          tsModelKey: 'classList',
          valueTranslator: (record: any): ClassList => {
            const value: ClassList = {
              age0: validateChuoKuClass(createClass(record['7か月'])), // 57日に対応できてない
              age1: validateChuoKuClass(createClass(record['1歳児'])),
              age2: validateChuoKuClass(createClass(record['2歳児'])),
              age3: validateChuoKuClass(createClass(record['3歳児'])),
              age4: validateChuoKuClass(createClass(record['4歳児'])),
              age5: validateChuoKuClass(createClass(record['5歳児'])),
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
  if (minimumIndex == '―') {
    // 何らかの理由で最低指数がない
    // 詳細は不明だが、空きがない・希望者がいない、クラスがない、個人情報保護のため非公開などが考えられる
    return { minimumIndex: null }
  }
  if (minimumIndex.match(/(\d+)点*以下/)) {
    const result = minimumIndex.match(/(\d+)点*以下/)
    return {
      minimumIndex: {
        type: 'le',
        threshold: parseInt(result![1]),
        text: minimumIndex,
      },
    }
  }
  if (minimumIndex.match(/(\d+)点*以上/)) {
    const result = minimumIndex.match(/(\d+)点*以上/)
    return {
      minimumIndex: {
        type: 'ge',
        threshold: parseInt(result![1]),
        text: minimumIndex,
      },
    }
  }
  if (minimumIndex == '空有') {
    // 一次調整の結果、全員入れてまだ空きがある場合
    return { minimumIndex: minimumIndex }
  }
  return { minimumIndex: parseInt(minimumIndex) }
}

const jsonFile = `${__dirname}/translated.json`
csv2json(data, jsonFile)
