import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  cacheKey,
  getCached,
  saveCache,
  seedCache,
  clearCache,
  CACHE_TTL_MS
} from '../src/utils/cache.js'

describe('cache', () => {
  beforeEach(() => clearCache())

  it('cacheKey normalizes coordinates', () => {
    assert.equal(cacheKey(55.7558, 37.6176), '55.7558,37.6176')
  })

  it('returns data while fresh (cache_cases: fresh)', () => {
    const data = { current: { temperature: 12 } }
    seedCache('k1', data, 30) // 30 seconds — within TTL
    const result = getCached('k1')
    assert.deepEqual(result, data)
  })

  it('returns null when expired (cache_cases: expired)', () => {
    const data = { current: { temperature: 12 } }
    seedCache('k2', data, 600) // 10 min > 5 min TTL
    assert.equal(getCached('k2'), null)
  })

  it('saveCache then getCached works', () => {
    const data = { ok: true }
    saveCache('k3', data)
    assert.deepEqual(getCached('k3'), data)
  })

  it('TTL is 5 minutes', () => {
    assert.equal(CACHE_TTL_MS, 5 * 60 * 1000)
  })
})
