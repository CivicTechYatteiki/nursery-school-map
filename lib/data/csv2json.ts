import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { Data, MergedData } from '../model/data'
import type { NurserySchool } from '../model/nursery-school'

interface TmpData {
  data: Data
  records: any
}

const minatoKuJsonFile = `${__dirname}/data/minato-ku/translated.json`

export const csv2json = (mergedData: MergedData) => {
  const tmpDataList: TmpData[] = mergedData.dataList.map(data => {
    const csv = fs.readFileSync(data.filePath)
    return {
      data: data,
      records: parse(csv, {columns: true, skipEmptyLines: true})
    }
  })
  const main: TmpData = tmpDataList[0]
  const additionals: TmpData[] = tmpDataList.slice(1)

  const nurserySchoolsMain: NurserySchool[] = main.records.map((record: any): NurserySchool | null => {
    var nurserySchool: any = {}
    var hasError: boolean = false
    nurserySchool.localName = mergedData.localName
    main.data.mapping.forEach(rule => {
      try {
        nurserySchool[rule.tsModelKey] = rule.valueTranslator(record)
        //console.log(rule.tsModelKey, nurserySchool[rule.tsModelKey])
      } catch(e) {
        hasError = true
        //console.error(e)
        // console.log("Process aborted.")
        // process.exit(1)
      }
    })
    if (hasError) {
      console.log(record)
      console.log(`\u001b[33m[Skip] above record. Because an error occurred. \u001b[0m`)
      return null
    }
    console.log(`[Parse Success] ${nurserySchool.name}`)
    return nurserySchool as NurserySchool
  })
  .filter((it: NurserySchool | null) => { return it != null })

  console.log("---")

  const nurserySchoolsAdditionals: NurserySchool[] = additionals.map((additional: TmpData) => {
    return additional.records.map((record: any) => {
      var nurserySchool: any = {}
      var hasError: boolean = false
      additional.data.mapping.forEach(rule => {
        try {
          nurserySchool[rule.tsModelKey] = rule.valueTranslator(record)
          //console.log(rule.tsModelKey, nurserySchool[rule.tsModelKey])
        } catch(e) {
          hasError = true
          // console.error(e)
          // console.log(record)
          // console.log(rule)
          // console.log("Process aborted.")
          // process.exit(1)
        }
      })
      if (hasError) {
        console.log(record)
        console.log(`\u001b[33m[Skip] above record. Because an error occurred. \u001b[0m`)
        return null
      }
      console.log(`[Parse Success] ${nurserySchool.name}`)
      return nurserySchool as NurserySchool
    })
  })
  .flat()
  .filter(it => { return it != null })

  const mergedList = nurserySchoolsMain.map(nurserySchool => {
    var merged = nurserySchool
    nurserySchoolsAdditionals
      .filter(it => { return it.name == nurserySchool.name })
      .forEach(it => { Object.assign(merged, JSON.parse(JSON.stringify(it)))})
    return merged
  })

  fs.writeFileSync(minatoKuJsonFile, JSON.stringify(mergedList))
  console.log(`[Output Success] ${minatoKuJsonFile}`)
}