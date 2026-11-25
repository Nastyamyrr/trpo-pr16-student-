import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeForecast, resolveWeatherCode } from '../src/utils/weatherCode.js'

/**
 * Обработка данных API + unknown weather code (test_cases).
 */
describe('API data handling', () => {
  const codes = {
    '0': 'Ясно',
    '3': 'Пасмурно',
    '61': 'Дождь'
  }

  it('unknown weather code → fallback label', () => {
    assert.equal(resolveWeatherCode(95, codes), 'Код 95')
  })

  it('full mock payload normalizes correctly', () => {
    const mock = {
      current: {
        temperature_2m: 12.4,
        weather_code: 3,
        wind_speed_10m: 4.8
      },
      daily: {
        time: ['2026-09-16', '2026-09-17', '2026-09-18'],
        temperature_2m_max: [15, 16, 14],
        temperature_2m_min: [7, 8, 6],
        weather_code: [3, 61, 2]
      }
    }
    const result = normalizeForecast(mock, codes)
    assert.equal(result.current.temperature, 12.4)
    assert.equal(result.current.wind_speed, 4.8)
    assert.equal(result.current.label, 'Пасмурно')
    assert.equal(result.daily[0].max, 15)
    assert.equal(result.daily[1].label, 'Дождь')
    // code 2 not in map → fallback
    assert.equal(result.daily[2].label, 'Код 2')
  })
})
