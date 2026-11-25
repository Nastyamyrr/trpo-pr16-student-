/**
 * Логика избранного без Vue runtime: проверяем операции над массивом
 * (та же модель, что в useFavorites).
 */
import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

function createFavoritesStore() {
  let list = []

  function isFavorite(city) {
    if (!city) return false
    return list.some(
      (f) => f.latitude === city.latitude && f.longitude === city.longitude
    )
  }

  function addFavorite(city) {
    if (!city || isFavorite(city)) return
    list = [...list, { ...city }]
  }

  function removeFavorite(city) {
    list = list.filter(
      (f) => !(f.latitude === city.latitude && f.longitude === city.longitude)
    )
  }

  function toggleFavorite(city) {
    if (isFavorite(city)) removeFavorite(city)
    else addFavorite(city)
  }

  return {
    get list() {
      return list
    },
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  }
}

describe('favorites operations (test_cases: favorite_add)', () => {
  let store
  const moscow = { name: 'Москва', latitude: 55.7558, longitude: 37.6176 }

  beforeEach(() => {
    store = createFavoritesStore()
  })

  it('adds city to favorites', () => {
    store.addFavorite(moscow)
    assert.equal(store.list.length, 1)
    assert.equal(store.isFavorite(moscow), true)
  })

  it('does not duplicate', () => {
    store.addFavorite(moscow)
    store.addFavorite(moscow)
    assert.equal(store.list.length, 1)
  })

  it('toggle removes', () => {
    store.toggleFavorite(moscow)
    assert.equal(store.isFavorite(moscow), true)
    store.toggleFavorite(moscow)
    assert.equal(store.isFavorite(moscow), false)
  })
})
