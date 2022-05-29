import { NurserySchool } from './nursery-school'
import minatoKuJson from '../data/minato-ku/translated.json'
import taitoKuJson from '../data/taito-ku/translated.json'
import chuoKuJson from '../data/chuo-ku/translated.json'

export interface LocalNurserySchoolListSet {
  localName: string // 自治体名
  nurserySchoolList: NurserySchool[]
}

export const getAllNurserySchoolListSets = (): LocalNurserySchoolListSet[] => {
  const minatoKuNurserySchoolList: LocalNurserySchoolListSet = {
    localName: '港区',
    nurserySchoolList: minatoKuJson as NurserySchool[],
  }
  const taitoKuNurserySchoolList: LocalNurserySchoolListSet = {
    localName: '台東区',
    nurserySchoolList: (taitoKuJson as NurserySchool[]).filter(it => {
      return it.location !== undefined
    }),
  }
  const chuoKuNurserySchoolList: LocalNurserySchoolListSet = {
    localName: '中央区',
    nurserySchoolList: chuoKuJson as unknown as NurserySchool[],
  }
  return [minatoKuNurserySchoolList, taitoKuNurserySchoolList, chuoKuNurserySchoolList]
}

export const filterLocalNurserySchoolList = (
  nurserySchoolSets: LocalNurserySchoolListSet[],
  localName: string
): NurserySchool[] => {
  const list = nurserySchoolSets.filter(it => {
    return it.localName == localName
  })

  if (list.length === 1) {
    throw new Error('Multiple locals found')
  }
  return list[0].nurserySchoolList
}
