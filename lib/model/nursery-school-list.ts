import { assert } from 'console';
import fs from 'fs'
import { minatoKuJsonFile } from "../csv2json";
import { NurserySchool } from "./nursery-school";

export interface LocalNurserySchoolList {
  localName: string // 自治体名
  nurseryShoolList: NurserySchool[]
}

const minatoKuNurserySchoolList: LocalNurserySchoolList = {
  localName: "港区",
  nurseryShoolList: (() => {
    const json = fs.readFileSync(minatoKuJsonFile, 'utf-8')
    const models: [NurserySchool] = JSON.parse(json)
    return models
  })()
}

export const allNurserySchoolList: LocalNurserySchoolList[] = [minatoKuNurserySchoolList]

export const getLocalNurserySchoolList = (localName: string): LocalNurserySchoolList => {
  const list = allNurserySchoolList.filter(it => {
    return it.localName == localName
  })

  assert(list.length === 1)
  return list[0]
}