import { describe, expect, test } from '@rstest/core'
import {
  DEFAULT_COLOR,
  HOME_URL,
  VALUES,
  towns,
  validateResult,
  validateValues,
} from './data'

describe('towns', () => {
  test('exports 53 towns', () => {
    expect(towns).toHaveLength(53)
  })

  test('every town has id, name, and at least one path', () => {
    for (const town of towns) {
      expect(typeof town.id).toBe('string')
      expect(typeof town.name).toBe('string')
      expect(town.paths.length).toBeGreaterThan(0)
    }
  })
})

describe('constants', () => {
  test('DEFAULT_COLOR is the expected hex value', () => {
    expect(DEFAULT_COLOR).toBe('#dd1a21')
  })

  test('HOME_URL is the expected GitHub Pages URL', () => {
    expect(HOME_URL).toBe('https://darklight721.github.io/cebu-level')
  })

  test('VALUES has expected shape', () => {
    expect(typeof VALUES.name).toBe('string')
    expect(typeof VALUES.showPoints).toBe('boolean')
    expect(Array.isArray(VALUES.levels)).toBe(true)
    expect(VALUES.levels.length).toBeGreaterThan(0)
  })
})

describe('validateValues', () => {
  test('returns true for the default VALUES shape', () => {
    expect(validateValues(VALUES)).toBe(true)
  })

  test('returns true for a minimal valid shape', () => {
    expect(
      validateValues({
        name: 'Test',
        showPoints: false,
        levels: [{ color: '#fff', name: 'A', points: 1 }],
      }),
    ).toBe(true)
  })

  test('returns false for null', () => {
    expect(validateValues(null)).toBe(false)
  })

  test('returns false when name is missing', () => {
    expect(validateValues({ showPoints: true, levels: [] })).toBe(false)
  })

  test('returns false when showPoints is not a boolean', () => {
    expect(validateValues({ name: 'X', showPoints: 'yes', levels: [] })).toBe(
      false,
    )
  })

  test('returns false when levels is not an array', () => {
    expect(validateValues({ name: 'X', showPoints: true, levels: null })).toBe(
      false,
    )
  })

  test('returns false when a level item is missing color', () => {
    expect(
      validateValues({
        name: 'X',
        showPoints: true,
        levels: [{ name: 'A', points: 1 }],
      }),
    ).toBe(false)
  })

  test('returns false when a level item has non-number points', () => {
    expect(
      validateValues({
        name: 'X',
        showPoints: true,
        levels: [{ color: '#fff', name: 'A', points: '1' }],
      }),
    ).toBe(false)
  })

  test('returns false when a level item is missing name', () => {
    expect(
      validateValues({
        name: 'X',
        showPoints: true,
        levels: [{ color: '#fff', points: 1 }],
      }),
    ).toBe(false)
  })

  test('returns false when a level item is missing points', () => {
    expect(
      validateValues({
        name: 'X',
        showPoints: true,
        levels: [{ color: '#fff', name: 'A' }],
      }),
    ).toBe(false)
  })
})

describe('validateResult', () => {
  test('returns true for a valid result object', () => {
    expect(validateResult({ Cebu_City: 0, Danao: 2 })).toBe(true)
  })

  test('returns true for an empty result', () => {
    expect(validateResult({})).toBe(true)
  })

  test('returns false for null', () => {
    expect(validateResult(null)).toBe(false)
  })

  test('returns false when a value is not a number', () => {
    expect(validateResult({ Cebu_City: '0' })).toBe(false)
  })

  test('returns false for a non-object', () => {
    expect(validateResult('string')).toBe(false)
  })
})
