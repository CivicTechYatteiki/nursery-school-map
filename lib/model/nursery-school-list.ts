import { NurserySchool } from './nursery-school'
import minatoKuJson from '../data/minato-ku/translated.json'

export interface LocalNurserySchoolListSet {
  localName: string // 自治体名
  nurseryShoolList: NurserySchool[]
}

export const getAllNurserySchoolListSets = (): LocalNurserySchoolListSet[] => {
  const minatoKuNurserySchoolList: LocalNurserySchoolListSet = {
    localName: '港区',
    nurseryShoolList: minatoKuJson as NurserySchool[],
  }
  return [minatoKuNurserySchoolList]
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
  return list[0].nurseryShoolList
}
