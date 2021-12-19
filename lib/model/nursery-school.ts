import { LocalNurserySchoolListSet } from './nursery-school-list'

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
    | 'na' // 空きか希望者がなく選考なし
    | 'other' // 希望者が少なく個人情報保護のため非公開、など
  value: number
  other?: string
}

export const getMinimumIndexRange = (age: number, inNurserySchool: NurserySchool): IndexRange => {
  const index: MinimumIndex | null = (() => {
    switch (age) {
      case 0:
        return inNurserySchool.classList?.age0?.minimumIndex ?? null
      case 1:
        return inNurserySchool.classList?.age1?.minimumIndex ?? null
      case 2:
        return inNurserySchool.classList?.age2?.minimumIndex ?? null
      case 3:
        return inNurserySchool.classList?.age3?.minimumIndex ?? null
      case 4:
        return inNurserySchool.classList?.age4?.minimumIndex ?? null
      case 5:
        return inNurserySchool.classList?.age5?.minimumIndex ?? null
      default:
        throw Error('Invalid age')
    }
  })()

  if (index == null) {
    return { type: 'na', value: 0 }
  }
  if (isRange(index)) {
    return { type: 'le', value: index.lessThanOrEqual }
  }
  return typeof index === 'number' ? { type: 'eq', value: index } : { type: 'other', value: 0, other: index }
}

export const enum AdmissionDifficulty {
  Easy = 1,
  Moderate = 2,
  Hard = 3,
}

export const getAdmissionDifficulty = (
  nurserySchool: NurserySchool,
  inSet: LocalNurserySchoolListSet,
  age: number | null
): AdmissionDifficulty | null => {
  // 入所最低指数をみて、
  // (最大値-3)〜最大値: 入りづらい
  // (最大値-10)〜(最大値-4): やや入りやすい
  // 0 〜 (最大値-11): 入りやすい
  // とする。実際に使ってみてまた調整する
  const age0Difficulty = (() => {
    const age0MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age0?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

    const target = nurserySchool.classList?.age0?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age0MinimuIndices)
  })()

  const age1Difficulty = (() => {
    const age1MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age1?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

    const target = nurserySchool.classList?.age1?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age1MinimuIndices)
  })()

  const age2Difficulty = (() => {
    const age2MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age2?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

    const target = nurserySchool.classList?.age2?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age2MinimuIndices)
  })()

  const age3Difficulty = (() => {
    const age3MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age3?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

    const target = nurserySchool.classList?.age3?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age3MinimuIndices)
  })()

  const age4Difficulty = (() => {
    const age4MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age4?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

    const target = nurserySchool.classList?.age4?.minimumIndex ?? null
    return estimateAdmissionDifficulty(target, age4MinimuIndices)
  })()

  const age5Difficulty = (() => {
    const age5MinimuIndices: number[] = inSet.nurseryShoolList
      .map(it => {
        return it.classList?.age5?.minimumIndex ?? null
      })
      .map(it => {
        return convertMinimumIndexToNumber(it)
      })
      .filter(it => {
        return it !== null
      }) as number[]

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
    case null:
      // 各年齢で入りやすさを求めて、最頻値を年齢指定がない場合の入りやすさとする
      var count = {
        [AdmissionDifficulty.Easy]: 0,
        [AdmissionDifficulty.Moderate]: 0,
        [AdmissionDifficulty.Hard]: 0,
      }
      const difficulties: AdmissionDifficulty[] = [
        age0Difficulty,
        age1Difficulty,
        age2Difficulty,
        age3Difficulty,
        age4Difficulty,
        age5Difficulty,
      ].filter(it => {
        return it !== null
      }) as AdmissionDifficulty[]

      if (difficulties.length === 0) {
        return null
      }

      difficulties.forEach(it => {
        count[it] += 1
      })

      console.log(nurserySchool.name, difficulties, count)

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
    default:
      throw Error('Invalid age')
  }
}

const convertMinimumIndexToNumber = (minimumIndex: MinimumIndex | null): number | null => {
  if (minimumIndex === null) {
    return null
  }
  if (minimumIndex === '非公開') {
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
    if (minimuIndexNumber <= max - 10) {
      return AdmissionDifficulty.Easy
    }
    if (minimuIndexNumber <= max - 3) {
      return AdmissionDifficulty.Moderate
    }
    return AdmissionDifficulty.Hard
  }

  const max = Math.max(...minimumIndices)

  if (target === null || target === '非公開') {
    return null
  } // 判定不能
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
  if (minimumIndex == '―') {
    // クラスはあるが、空きがない・希望者がいないため最低指数がない
    return { minimumIndex: null }
  }
  if (minimumIndex == '非公開') {
    // 内定者が1人の場合など、個人情報となるため非公開
    return { minimumIndex: minimumIndex }
  }
  if (minimumIndex.match(/(\d+)以下/)) {
    const result = minimumIndex.match(/(\d+)以下/)
    return {
      minimumIndex: {
        lessThanOrEqual: parseInt(result![1]),
        text: minimumIndex,
      },
    }
  }
  return { minimumIndex: parseInt(minimumIndex) }
}
