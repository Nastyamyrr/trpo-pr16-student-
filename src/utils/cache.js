/**
 * Простой in-memory кэш с TTL.
 * TTL = 5 минут: баланс между актуальностью погоды и числом запросов к API.
 */
export const CACHE_TTL_MS = 5 * 60 * 1000

const store = new Map()

export function cacheKey(latitude, longitude) {
  return `${Number(latitude).toFixed(4)},${Number(longitude).toFixed(4)}`
}

export function getCached(key) {
  const record = store.get(key)
  if (!record) return null
  if (Date.now() - record.savedAt > CACHE_TTL_MS) {
    store.delete(key)
    return null
  }
  return record.data
}

export function getCachedMeta(key) {
  const record = store.get(key)
  if (!record) return null
  return {
    data: record.data,
    savedAt: record.savedAt,
    ageMs: Date.now() - record.savedAt,
    expired: Date.now() - record.savedAt > CACHE_TTL_MS
  }
}

export function saveCache(key, data) {
  store.set(key, { savedAt: Date.now(), data })
}

export function clearCache() {
  store.clear()
}

/** Для тестов: положить запись с произвольным age */
export function seedCache(key, data, ageSeconds = 0) {
  store.set(key, {
    savedAt: Date.now() - ageSeconds * 1000,
    data
  })
}
