import { LocalNurserySchoolListSet } from './nursery-school-list'

export const SUPPORTED_AGES = Object.freeze([0, 1, 2, 3, 4, 5]) as number[]

export interface NurserySchool {
  name: string
  address: string
  tel: string | null
  url: string | null
  openYear: number | null
  openMonth: number | null
  // institutionType: string // 施設種別。認可保育園、小規模保育事業など。港区と台東区で形式が違うので一旦削る
  // ownerType: string // 種別。私立、区立など。港区と台東区で形式が違うので一旦削る
  location: GeoLocation
  admissionAgeInMonth: string | null // 入園可能月齢。3ヶ月、57日など。データがない場合はnull
  classList: ClassList | null
  localName: string // 自治体名
  sources: [Source] // 情報元
}

const isRange = (value: any): value is Range => {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.lessThanOrEqual === 'number' &&
    typeof value.text === 'string'
  )
}

interface IndexRange {
  type:
    | 'eq' // 即値
    | 'le' // 以下
    | 'noClass' // 枠なし
    | 'na' // 空きか希望者がなく選考なし
    | 'hasVacancy' // 一次調整で応募者全員が入れてまだ空きがある場合（台東区では指数ではなく空有というデータになっている）
    | 'other' // 希望者が少なく個人情報保護のため非公開、など
  value: number
  text?: string
}

export const getIsOpened = (openYear: number | null, openMonth: number | null): boolean => {
  if (openYear === null) {
    return true
  }
  if (openMonth === null) {
    return true
  }

  const now = new Date()
  const openDate = new Date(openYear, openMonth - 1, 1)
  return now >= openDate
}

export const getMinimumIndexRange = (age: number, inNurserySchool: NurserySchool): IndexRange => {
  const nClass: Class | null = (() => {
    switch (age) {
      case 0:
        return inNurserySchool.classList?.age0 ?? null
      case 1:
        return inNurserySchool.classList?.age1 ?? null
      case 2:
        return inNurserySchool.classList?.age2 ?? null
      case 3:
        return inNurserySchool.classList?.age3 ?? null
      case 4:
        return inNurserySchool.classList?.age4 ?? null
      case 5:
        return inNurserySchool.classList?.age5 ?? null
      default:
        throw Error('Invalid age')
    }
  })()
  if (!nClass) {
    return { type: 'noClass', value: 0 }
  }

  const index = nClass.minimumIndex
  if (index == null) {
    return { type: 'na', value: 0 }
  }
  if (index === '空有') {
    return { type: 'hasVacancy', value: 0, text: index }
  }
  if (isRange(index)) {
    return { type: 'le', value: index.lessThanOrEqual }
  }
  return typeof index === 'number' ? { type: 'eq', value: index } : { type: 'other', value: 0, text: index }
}

export const enum AdmissionDifficulty {
  Easy = 1,
  Moderate = 2,
  Hard = 3,
  Unknown = 4,
}

export const getAdmissionDifficulty = (
  nurserySchool: NurserySchool,
  inSet: LocalNurserySchoolListSet,
  age: number
): AdmissionDifficulty | null => {
  // 入所最低指数をみて、
  // (最大値-3)〜最大値: 入りづらい
  // (最大値-10)〜(最大値-4): やや入りやすい
  // 0 〜 (最大値-11): 入りやすい
  // とする。実際に使ってみてまた調整する
  const age0Difficulty: AdmissionDifficulty | null = (() => {
    const age0MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age0?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age0?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age0MinimuIndices)
  })()

  const age1Difficulty: AdmissionDifficulty | null = (() => {
    const age1MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age1?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age1?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age1MinimuIndices)
  })()

  const age2Difficulty: AdmissionDifficulty | null = (() => {
    const age2MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age2?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age2?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age2MinimuIndices)
  })()

  const age3Difficulty: AdmissionDifficulty | null = (() => {
    const age3MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age3?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age3?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age3MinimuIndices)
  })()

  const age4Difficulty: AdmissionDifficulty | null = (() => {
    const age4MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age4?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age4?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age4MinimuIndices)
  })()

  const age5Difficulty: AdmissionDifficulty | null = (() => {
    const age5MinimuIndices: number[] = inSet.nurserySchoolList
      .map(it => it.classList?.age5?.minimumIndex ?? null)
      .map(it => convertMinimumIndexToNumber(it))
      .filter(it => it !== null) as number[]

    const target = nurserySchool.classList?.age5?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age5MinimuIndices)
  })()

  switch (age) {
    case 0:
      return age0Difficulty
    case 1:
      return age1Difficulty
    case 2:
      return age2Difficulty
    case 3:
      return age3Difficulty
    case 4:
      return age4Difficulty
    case 5:
      return age5Difficulty
    default:
      return null
  }
}

// 複数の年齢を指定して、入りやすさの最頻値を返す
export const getModeAdmissionDifficulty = (
  nurserySchool: NurserySchool,
  inSet: LocalNurserySchoolListSet,
  ageList: number[]
): AdmissionDifficulty | null => {
  const difficulties: AdmissionDifficulty[] = ageList
    .map(age => {
      if (age === null) return null
      return getAdmissionDifficulty(nurserySchool, inSet, age)
    })
    .filter(it => it !== null) as AdmissionDifficulty[]

  if (difficulties.length === 0) {
    return null
  }

  // 最頻値を入りやすさとする
  var count = {
    [AdmissionDifficulty.Easy]: 0,
    [AdmissionDifficulty.Moderate]: 0,
    [AdmissionDifficulty.Hard]: 0,
    [AdmissionDifficulty.Unknown]: 0,
  }

  difficulties.forEach(it => {
    count[it] += 1
  })

  //console.log(nurserySchool.name, difficulties, count)

  // ここではUnknownは外して算出する
  if (
    count[AdmissionDifficulty.Easy] > count[AdmissionDifficulty.Moderate] &&
    count[AdmissionDifficulty.Easy] > count[AdmissionDifficulty.Hard]
  ) {
    return AdmissionDifficulty.Easy
  } else if (
    count[AdmissionDifficulty.Moderate] >= count[AdmissionDifficulty.Easy] &&
    count[AdmissionDifficulty.Moderate] > count[AdmissionDifficulty.Hard]
  ) {
    return AdmissionDifficulty.Moderate
  } else if (
    count[AdmissionDifficulty.Hard] >= count[AdmissionDifficulty.Easy] &&
    count[AdmissionDifficulty.Hard] >= count[AdmissionDifficulty.Moderate]
  ) {
    return AdmissionDifficulty.Hard
  }
  throw Error('Unexpected error')
}

// 複数の年齢を指定して、AND条件で入りやすさを返す
// 0歳と2歳を指定した場合、片方が入りやすくても、もう片方が入りにくかったら「入りにくい」と扱う
export const getHigherAdmissionDifficulty = (
  nurserySchool: NurserySchool,
  inSet: LocalNurserySchoolListSet,
  ageList: number[]
): AdmissionDifficulty | null => {
  const difficulties: AdmissionDifficulty[] = ageList
    .map(age => {
      if (age === null) return null
      return getAdmissionDifficulty(nurserySchool, inSet, age)
    })
    .filter(it => it !== null) as AdmissionDifficulty[]

  if (difficulties.length === 0) {
    return null
  }

  var count = {
    [AdmissionDifficulty.Easy]: 0,
    [AdmissionDifficulty.Moderate]: 0,
    [AdmissionDifficulty.Hard]: 0,
    [AdmissionDifficulty.Unknown]: 0,
  }

  difficulties.forEach(it => {
    count[it] += 1
  })

  //console.log(nurserySchool.name, count)

  if (count[AdmissionDifficulty.Unknown] > 0) {
    return AdmissionDifficulty.Unknown
  }
  if (count[AdmissionDifficulty.Hard] > 0) {
    return AdmissionDifficulty.Hard
  }
  if (count[AdmissionDifficulty.Moderate] > 0) {
    return AdmissionDifficulty.Moderate
  }
  if (count[AdmissionDifficulty.Easy] > 0) {
    return AdmissionDifficulty.Easy
  }

  throw Error('Unexpected error')
}

const convertMinimumIndexToNumber = (minimumIndex: MinimumIndex | null): number | null => {
  if (minimumIndex === null) {
    return null
  }
  if (minimumIndex === '非公開') {
    return null
  }
  if (minimumIndex === '空有') {
    return null
  }
  if (typeof minimumIndex === 'number') {
    return minimumIndex
  }
  if (typeof (minimumIndex as Range).lessThanOrEqual === 'number') {
    return minimumIndex.lessThanOrEqual
  }
  return null
}

const estimateAdmissionDifficulty = (
  target: MinimumIndex | null,
  minimumIndices: number[]
): AdmissionDifficulty | null => {
  const value = (minimuIndexNumber: number, max: number): AdmissionDifficulty => {
    if (minimuIndexNumber <= max * 0.8) {
      return AdmissionDifficulty.Easy
    }
    if (minimuIndexNumber <= max * 0.925) {
      return AdmissionDifficulty.Moderate
    }
    return AdmissionDifficulty.Hard
  }

  const max = Math.max(...minimumIndices)

  if (target === null || target === '非公開') {
    return AdmissionDifficulty.Unknown
  } // 判定不能
  if (target === '空有') {
    return AdmissionDifficulty.Easy
  }
  if (typeof target === 'number') {
    return value(target, max)
  }
  if (typeof (target as Range).lessThanOrEqual === 'number') {
    const number: number = (target as Range).lessThanOrEqual
    return value(number, max)
  }
  return null
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

type MinimumIndex = number | Range | '非公開' | '空有'

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
