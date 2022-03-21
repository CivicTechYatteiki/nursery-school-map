import { csv2json } from '../csv2json'
import {
  validateClass,
  validateNumber,
  validateOptionalNumber,
  validateString,
  validateOptionalString,
  validateSource,
} from '../validator'
import { ClassList, createClass, GeoLocation, NurserySchool, Source } from '../../model/nursery-school'
import { MergedData } from '../../model/data'

// 保育園のWebサイトのURLは、手動で入力したものを利用。将来的には、オープンデータのなかに追加される予定
// 2022年4月新設の保育園も手動で入力したものを利用
const minatoKuHoikuen: Source = {
  name: '港区内認可保育園等一覧',
  ver: 'Ver202104',
  url: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000001/resource/a208f801-ce87-4fb9-96d0-ba38813ea330',
  filePath: __dirname + '/hoikuen.csv',
}

const minatoKuHoikuenSaiteiShisu: Source = {
  name: '令和3年4月入所1次利用調整における入所者最低指数',
  ver: 'Ver202104',
  url: 'https://catalog.data.metro.tokyo.lg.jp/dataset/t131032d0000000001/resource/e81871d0-1d09-453b-b492-2321e3335e26',
  filePath: __dirname + '/hoikuen_saiteishisu.csv',
}

const minatoKu: MergedData = {
  localName: '港区',
  dataList: [
    {
      filePath: minatoKuHoikuen.filePath,
      mapping: [
        {
          tsModelKey: 'institutionType',
          valueTranslator: (record: any): string => {
            return validateString(record['施設種別'])
          },
        },
        {
          tsModelKey: 'area',
          valueTranslator: (record: any): string => {
            return validateString(record['地区'])
          },
        },
        {
          tsModelKey: 'name',
          valueTranslator: (record: any): string => {
            return validateString(record['保育園名'])
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
              latitude: validateNumber(parseFloat(record['緯度'])),
              longitude: validateNumber(parseFloat(record['経度'])),
            }
            return value
          },
        },
        {
          tsModelKey: 'ownerType',
          valueTranslator: (record: any): string => {
            return validateString(record['種別'])
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
            return validateOptionalNumber(parseInt(record['開設年']))
          },
        },
        {
          tsModelKey: 'openMonth',
          valueTranslator: (record: any): number | null => {
            return validateOptionalNumber(parseInt(record['開設月']))
          },
        },
        {
          tsModelKey: 'admissionAgeInMonth',
          valueTranslator: (record: any): string | null => {
            return validateOptionalString(record['入園可能月齢'])
          },
        },
        {
          tsModelKey: 'sources',
          valueTranslator: (record: any): Source[] => {
            return [validateSource(minatoKuHoikuen)]
          },
        },
      ],
    },
    {
      filePath: minatoKuHoikuenSaiteiShisu.filePath,
      mapping: [
        {
          tsModelKey: 'name',
          valueTranslator: (record: any): string => {
            return validateString(record['保育園名'])
          },
        },
        {
          tsModelKey: 'classList',
          valueTranslator: (record: any): ClassList => {
            const value: ClassList = {
              age0: validateClass(createClass(record['0歳'])),
              age1: validateClass(createClass(record['1歳'])),
              age2: validateClass(createClass(record['2歳'])),
              age3: validateClass(createClass(record['3歳'])),
              age4: validateClass(createClass(record['4歳'])),
              age5: validateClass(createClass(record['5歳'])),
              minimumIndexSource: validateSource(minatoKuHoikuenSaiteiShisu),
            }
            return value
          },
        },
      ],
    },
  ],
}

csv2json(minatoKu)
