import { ref, computed } from 'vue'
import {
  cacheKey,
  getCached,
  getCachedMeta,
  saveCache,
  CACHE_TTL_MS
} from '../utils/cache.js'
import { normalizeForecast } from '../utils/weatherCode.js'

/**
 * Weather composable: кэш, AbortController, сохранение последнего успеха,
 * offline mock, признак устаревших данных.
 */
export function useWeather() {
  const weather = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)
  const offlineMode = ref(false)
  const fromCache = ref(false)
  const isStale = ref(false)

  let controller = null
  let requestId = 0

  const hasData = computed(() => weather.value !== null)

  function buildUrl(latitude, longitude, fields) {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(latitude))
    url.searchParams.set('longitude', String(longitude))
    url.searchParams.set('current', fields.current.join(','))
    url.searchParams.set('daily', fields.daily.join(','))
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('forecast_days', '3')
    return url
  }

  /**
   * @param city
   * @param fields
   * @param codesMap
   * @param {{ force?: boolean }} options — force=true игнорирует кэш (ручное обновление)
   */
  async function fetchWeather(city, fields, codesMap, options = {}) {
    if (!city?.latitude || !city?.longitude) {
      error.value = 'Город не выбран'
      return
    }

    const key = cacheKey(city.latitude, city.longitude)

    // 1. Кэш (если не force)
    if (!options.force && !offlineMode.value) {
      const cached = getCached(key)
      if (cached) {
        weather.value = cached
        fromCache.value = true
        isStale.value = false
        error.value = null
        lastUpdated.value = new Date()
        return { source: 'cache' }
      }
    }

    // 2. Отмена предыдущего запроса (защита от гонки)
    controller?.abort()
    controller = new AbortController()
    const myId = ++requestId

    loading.value = true
    error.value = null
    fromCache.value = false

    try {
      let raw

      if (offlineMode.value) {
        const res = await fetch('/dataset/mock_forecast.json', {
          signal: controller.signal
        })
        if (!res.ok) throw new Error(`Mock HTTP ${res.status}`)
        raw = await res.json()
      } else {
        const url = buildUrl(city.latitude, city.longitude, fields)
        const res = await fetch(url.toString(), { signal: controller.signal })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: не удалось получить данные погоды`)
        }
        raw = await res.json()
      }

      // Устаревший ответ игнорируем
      if (myId !== requestId) return { source: 'stale-response' }

      const normalized = normalizeForecast(raw, codesMap)
      weather.value = normalized
      isStale.value = false
      lastUpdated.value = new Date()
      saveCache(key, normalized)

      return { source: offlineMode.value ? 'mock' : 'network' }
    } catch (e) {
      if (e.name === 'AbortError') {
        return { source: 'aborted' }
      }

      // Не затираем последний успешный прогноз
      error.value = e.message || 'Неизвестная ошибка загрузки'
      if (weather.value) {
        isStale.value = true
      }
      return { source: 'error' }
    } finally {
      if (myId === requestId) {
        loading.value = false
      }
    }
  }

  function setOfflineMode(value) {
    offlineMode.value = Boolean(value)
  }

  function clear() {
    weather.value = null
    error.value = null
    lastUpdated.value = null
    fromCache.value = false
    isStale.value = false
  }

  return {
    weather,
    loading,
    error,
    lastUpdated,
    offlineMode,
    fromCache,
    isStale,
    hasData,
    CACHE_TTL_MS,
    fetchWeather,
    setOfflineMode,
    clear,
    buildUrl,
    getCachedMeta,
    cacheKey
  }
}
