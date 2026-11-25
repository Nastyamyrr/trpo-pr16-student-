import { ref, watch } from 'vue'

const STORAGE_KEY = 'trpo-pr16-favorites'

/**
 * Избранные города. Чтение/запись localStorage вынесены сюда.
 */
export function useFavorites() {
  const favorites = ref(load())

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  function persist(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // quota / private mode — тихо игнорируем
    }
  }

  function isFavorite(city) {
    if (!city) return false
    return favorites.value.some(
      (f) => f.latitude === city.latitude && f.longitude === city.longitude
    )
  }

  function addFavorite(city) {
    if (!city || isFavorite(city)) return
    favorites.value = [
      ...favorites.value,
      {
        id: city.id,
        name: city.name,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone
      }
    ]
    persist(favorites.value)
  }

  function removeFavorite(city) {
    favorites.value = favorites.value.filter(
      (f) => !(f.latitude === city.latitude && f.longitude === city.longitude)
    )
    persist(favorites.value)
  }

  function toggleFavorite(city) {
    if (isFavorite(city)) removeFavorite(city)
    else addFavorite(city)
  }

  watch(favorites, (list) => persist(list), { deep: true })

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  }
}
