export function tryParse<T>(text: string | null, defaultValue: T) {
  try {
    return (text && (JSON.parse(text) as T)) || defaultValue
  } catch {
    return defaultValue
  }
}
