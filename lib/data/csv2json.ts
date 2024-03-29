import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { Data, MergedData } from '../model/data'
import type { NurserySchool } from '../model/nursery-school'

interface TmpData {
  data: Data
  records: any
}

export const csv2json = (mergedData: MergedData, outputFile: string, unminifiedOutputFile: string | null = null) => {
  const tmpDataList: TmpData[] = mergedData.dataList.map(data => {
    const csv = fs.readFileSync(data.filePath)
    return {
      data: data,
      records: parse(csv, { columns: true, skipEmptyLines: true }).filter((record: any) => {
        return data.filter(record)
      }),
    }
  })
  const main: TmpData = tmpDataList[0]
  const additionals: TmpData[] = tmpDataList.slice(1)

  const nurserySchoolsMain: NurserySchool[] = main.records
    .map((record: any): NurserySchool | null => {
      var nurserySchool: any = {}
      var hasError: boolean = false
      nurserySchool.localName = mergedData.localName
      main.data.mapping.forEach(rule => {
        try {
          nurserySchool[rule.tsModelKey] = rule.valueTranslator(record)
          console.log(rule.tsModelKey, nurserySchool[rule.tsModelKey])
        } catch (e) {
          hasError = true
          console.error(e)
          console.log('Process aborted.')
          process.exit(1)
        }
      })
      if (hasError) {
        console.log(record)
        console.log(`\u001b[33m[Skip] above record. Because an error occurred. \u001b[0m`)
        return null
      }
      console.log(`[Parse Success] ${nurserySchool.name} ${nurserySchool.url}`)
      return nurserySchool as NurserySchool
    })
    .filter((it: NurserySchool | null) => {
      return it != null
    })

  console.log('---')

  const nurserySchoolsAdditionals: NurserySchool[] = additionals
    .map((additional: TmpData) => {
      return additional.records.map((record: any) => {
        var nurserySchool: any = {}
        var hasError: boolean = false
        additional.data.mapping.forEach(rule => {
          try {
            nurserySchool[rule.tsModelKey] = rule.valueTranslator(record)
            console.log(rule.tsModelKey, nurserySchool[rule.tsModelKey])
          } catch (e) {
            hasError = true
            console.error(e)
            // console.log(record)
            // console.log(rule)
            console.log('Process aborted.')
            process.exit(1)
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
    .filter(it => {
      return it != null
    })

  const zenkaku2hankaku = (str: string): string => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    })
  }

  const larger =
    nurserySchoolsMain.length >= nurserySchoolsAdditionals.length ? nurserySchoolsMain : nurserySchoolsAdditionals
  const smaller =
    nurserySchoolsMain.length < nurserySchoolsAdditionals.length ? nurserySchoolsMain : nurserySchoolsAdditionals
  const nameForMerge = (name: string): string => {
    var n = name
    n = n.replace(/\（[^\）]*\）/g, '') // 全角のカッコ書きを削除
    n = n.replace(/\([^\)]*\)/g, '') // 半角のカッコ書きを削除
    n = n.replace(/\s+/g, '') // 空白文字を削除
    n = zenkaku2hankaku(n) // 英数を半角に統一
    n = n.normalize('NFC') // 結合文字（2文字）で濁点が表現されている場合に、正規化して1文字にする。https://qiita.com/jkr_2255/items/e0c039c438d3ebfd1a6a
    return n
  }
  const mergedList = larger.map(record1 => {
    var merged = record1
    smaller
      .filter(record2 => {
        // if (
        //   nameForMerge(record2.name) === 'TKチルドレンズファーム湊校' ||
        //   nameForMerge(record1.name) === 'TKチルドレンズファーム湊校'
        // ) {
        //   console.log(record2.name, record1.name, nameForMerge(record2.name), nameForMerge(record1.name))
        // }
        return nameForMerge(record2.name) === nameForMerge(record1.name)
      })
      .forEach(record2 => {
        Object.assign(merged, JSON.parse(JSON.stringify(record2)))
      })
    return merged
  })

  var hasError: boolean = false
  mergedList.forEach(nurserySchool => {
    if (!nurserySchool.location) {
      hasError = true
      console.log(`${nurserySchool.name}: location is required`)
    }
    if (!nurserySchool.classList) {
      hasError = true
      console.log(`${nurserySchool.name}: classList is required`)
    }
  })
  // if (hasError) {
  //   console.log('Process aborted.')
  //   process.exit(1)
  // }

  fs.writeFileSync(outputFile, JSON.stringify(mergedList))
  if (unminifiedOutputFile != null) {
    fs.writeFileSync(unminifiedOutputFile, JSON.stringify(mergedList, null, 2))
  }
  console.log(`[Output Success] ${outputFile}`)
}
