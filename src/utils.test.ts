import { afterEach, beforeEach, describe, expect, test } from '@rstest/core'
import JSONCrush from 'jsoncrush'
import { validateResult, validateValues } from './data'
import { getFromLocalStorage, saveToLocalStorage, unpackObject } from './utils'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('saveToLocalStorage', () => {
  test('serializes value as JSON and stores it', () => {
    const obj = { a: 1, b: 'hello' }
    saveToLocalStorage('key', obj)
    expect(localStorage.getItem('key')).toBe(JSON.stringify(obj))
  })
})

describe('getFromLocalStorage', () => {
  test('returns parsed value when it passes validation', () => {
    const result = { Cebu_City: 0 }
    localStorage.setItem('result', JSON.stringify(result))
    expect(getFromLocalStorage('result', validateResult)).toEqual(result)
  })

  test('returns null when key is absent', () => {
    expect(getFromLocalStorage('missing', validateResult)).toBeNull()
  })

  test('returns null when stored value fails validation', () => {
    localStorage.setItem('result', JSON.stringify({ Cebu_City: 'bad' }))
    expect(getFromLocalStorage('result', validateResult)).toBeNull()
  })

  test('returns null when stored value is invalid JSON', () => {
    localStorage.setItem('result', '{not valid json')
    expect(getFromLocalStorage('result', validateResult)).toBeNull()
  })
})

describe('unpackObject', () => {
  test('returns parsed value when it passes validation', () => {
    const result = { Cebu_City: 0 }
    const crushed = JSONCrush.crush(JSON.stringify(result))
    expect(unpackObject(crushed, validateResult)).toEqual(result)
  })

  test('returns null when validation fails', () => {
    const bad = { Cebu_City: 'not-a-number' }
    const crushed = JSONCrush.crush(JSON.stringify(bad))
    expect(unpackObject(crushed, validateResult)).toBeNull()
  })

  test('returns null when the crushed string is corrupt / unparseable JSON', () => {
    // JSONCrush.uncrush of arbitrary garbage returns something that won't parse as JSON
    expect(unpackObject('!!!NOTVALID!!!', validateValues)).toBeNull()
  })
})
