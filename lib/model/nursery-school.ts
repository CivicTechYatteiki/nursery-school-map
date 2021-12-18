import { getLocalNurserySchoolList } from './nursery-school-list'

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
  localName: string // 自治体名
  sources: [Source] // 情報元
}

type EasyToEnter = '入りやすい' | 'やや入りやすい' | '入りづらい'

const convertMinimumIndexToNumber = (minimumIndex: MinimumIndex | null): number | null => {
  if (minimumIndex === null) { return null }
  if (minimumIndex === '非公開') { return null }
  if (typeof(minimumIndex) === "number") { return minimumIndex }
  if (typeof((minimumIndex as Range).lessThanOrEqual) === "number") { return minimumIndex.lessThanOrEqual }
  return null
}

const easyToEnter = (target: MinimumIndex | null, minimumIndices: number[]): EasyToEnter | null=> {
  const value = (minimuIndexNumber: number, max: number): EasyToEnter => {
    if (minimuIndexNumber <= max - 10) { return '入りやすい' }
    if (minimuIndexNumber <= max - 3) { return 'やや入りやすい' }
    return '入りづらい'
  }

  const max = Math.max(...minimumIndices)

  if (target === null || target === '非公開') { return null } // 判定不能
  if (typeof(target) === 'number') {
    return value(target, max)
  }
  if ((typeof(target as Range).lessThanOrEqual) === 'number') {
    const number: number = (target as Range).lessThanOrEqual
    return value(number, max)
  }
  return null
}

export const getEasyToEnter = (nurserySchool: NurserySchool, age: number | null): EasyToEnter | null => {
  const list = getLocalNurserySchoolList(nurserySchool.localName).nurseryShoolList
  // 入所最低指数をみて、
  // (最大値-3)〜最大値: 入りづらい
  // (最大値-10)〜(最大値-4): やや入りやすい
  // 0 〜 (最大値-11): 入りやすい
  // とする。実際に使ってみてまた調整する
  // TODO: 実装
  if (age === null) {
    // 各年齢で入りやすさを求めて、最頻値を年齢指定がない場合の入りやすさとする
    return '入りづらい'
  } else if (age === 0) {
    const age0MinimuIndices: number[] = list
      .map(it => { return it.classList?.age0?.minimumIndex ?? null })
      .map(it => { return convertMinimumIndexToNumber(it) })
      .filter(it => { return it !== null }) as number[]

    const target = nurserySchool.classList?.age0?.minimumIndex ?? null
    return easyToEnter(target, age0MinimuIndices)

  } else if (age === 1) {
    return '入りづらい'
  } else if (age === 2) {
    return '入りづらい'
  } else if (age === 3) {
    return '入りづらい'
  } else if (age === 4) {
    return '入りづらい'
  } else if (age === 5) {
    return '入りづらい'
  } else {
    throw Error("Invalid age")
  }
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