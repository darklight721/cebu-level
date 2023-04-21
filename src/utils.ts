import JSONCrush from 'jsoncrush'

export function tryParse<T>(text: string | null, defaultValue = null) {
  try {
    return (text && (JSON.parse(text) as T)) || defaultValue
  } catch {
    return defaultValue
  }
}

export function saveToLocalStorage(key: string, value: object) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getFromLocalStorage<T>(key: string) {
  return tryParse<T>(localStorage.getItem(key))
}

export function unpackObject<T>(data: string) {
  return tryParse<T>(JSONCrush.uncrush(data))
}
