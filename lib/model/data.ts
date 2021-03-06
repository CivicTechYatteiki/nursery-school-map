export interface Data {
  filePath: string
  filter: Function
  mapping: Mapping[]
}

export interface Mapping {
  //columnName: string // ex) 保育園名, 0歳
  tsModelKey: string // ex) name, classList.age0.minimumIndex
  valueTranslator: Function
}

export interface MergedData {
  localName: string
  dataList: Data[]
}
