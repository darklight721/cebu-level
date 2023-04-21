import JSONCrush from 'jsoncrush'

function tryParse(text: string | null, defaultValue = null) {
  try {
    return (text && JSON.parse(text)) || defaultValue
  } catch {
    return defaultValue
  }
}

export function saveToLocalStorage(key: string, value: object) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getFromLocalStorage<T>(
  key: string,
  validate: (d: any) => d is T
) {
  const value = tryParse(localStorage.getItem(key))
  return validate(value) ? value : null
}

export function unpackObject<T>(data: string, validate: (d: any) => d is T) {
  const value = tryParse(JSONCrush.uncrush(data))
  return validate(value) ? value : null
}
