import { Class, Source, Range } from '../model/nursery-school'

export const validateString = (value: string): string => {
  if (typeof value != 'string') {
    throw Error('Invalid type')
  }
  if (value.length == 0) {
    throw Error('Empty string')
  }
  return value
}

export const validateOptionalString = (value: string): string | null => {
  if (typeof value != 'string') {
    throw Error('Invalid type')
  }
  if (value.length == 0) {
    return null
  }
  return value
}

export const validateNumber = (value: number): number => {
  if (typeof value != 'number') {
    throw Error('Invalid type: ' + value)
  }
  return value
}

export const validateOptionalNumber = (value: number): number | null => {
  if (Number.isNaN(value)) {
    return null
  }
  if (typeof value != 'number') {
    throw Error('Invalid type: ' + value)
  }
  return value
}

// minimumIndexは、number | Range | '非公開' | null
export const validateMinatoKuClass = (value: Class | null): Class | null => {
  if (value == null) {
    return value
  }
  if (value.minimumIndex == null) {
    return value
  }
  if (typeof value.minimumIndex == 'number') {
    return value
  }
  if (typeof (value.minimumIndex as Range).threshold == 'number') {
    return value
  }
  if (value.minimumIndex == '非公開') {
    return value
  }
  throw Error('Invalid type')
}

export const validateTaitoKuClass = (value: Class | null): Class | null => {
  if (value == null) {
    return value
  }
  if (value.minimumIndex == null) {
    return value
  }
  if (typeof value.minimumIndex == 'number') {
    return value
  }
  if (value.minimumIndex == '非公開') {
    return value
  }
  if (value.minimumIndex == '空有') {
    return value
  }
  throw Error('Invalid type')
}

export const validateChuoKuClass = (value: Class | null): Class | null => {
  if (value === null) {
    return value
  }
  if (value.minimumIndex === null) {
    return value
  }
  if (typeof value.minimumIndex === 'number') {
    return value
  }
  if (typeof (value.minimumIndex as Range).threshold === 'number') {
    return value
  }
  if (value.minimumIndex === '空有') {
    return value
  }
  throw Error('Invalid type')
}

export const validateSource = (value: Source): Source => {
  validateString(value.name)
  validateOptionalString(value.ver)
  validateString(value.url)
  validateString(value.filePath)
  return value
}
