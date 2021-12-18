export interface NurserySchool {
  name: string
  address: string
  area: string // 地区。赤坂、高輪など
  tel: string
  institutionType: string // 施設種別。認可保育園、小規模保育事業など
  ownerType: string // 種別。私立、区立など
  location: GeoLocation
  admissionAgeInMonth: string | null // 入園可能月齢。3ヶ月、57日など。データがない場合はnull
  classList: ClassList | null
  sources: [Source] // 情報元
}

export interface GeoLocation {
  latitude: number // 緯度
  longitude: number // 経度
}

export interface ClassList {
  age0: Class | null // 受け入れ枠がない場合はnull
  age1: Class | null
  age2: Class | null
  age3: Class | null
  age4: Class | null
  age5: Class | null
  //capacitySource: Source
  minimumIndexSource: Source
}

export interface Class {
  //capacity: number // 定員
  minimumIndex: MinimumIndex | null // 入所最低指数。空きがない、希望者がいない場合はnull
}

type MinimumIndex = number | Range | '非公開'

export interface Range {
  lessThanOrEqual: number // 22
  text: string // 22以下
}

export interface Source {
  name: string // 令和3年4月入所1次利用調整における入所者最低指数
  ver: string // Ver202104
  url: string
  filePath: string
}

export const createClass = (minimumIndex: string): Class | null => {
  if (minimumIndex.length == 0) {
    // 定員がない（＝クラスがない）
    return null
  }
  if (minimumIndex == "―") {
    // クラスはあるが、空きがない・希望者がいないため最低指数がない
    return { minimumIndex: null }
  }
  if (minimumIndex == "非公開") {
    // 内定者が1人の場合など、個人情報となるため非公開
    return { minimumIndex: minimumIndex }
  }
  if (minimumIndex.match(/(\d+)以下/)) {
    const result = minimumIndex.match(/(\d+)以下/)
    return {
      minimumIndex: {
        lessThanOrEqual: parseInt(result![1]),
        text: minimumIndex
      }
    }
  }
  return { minimumIndex: parseInt(minimumIndex) }
}
