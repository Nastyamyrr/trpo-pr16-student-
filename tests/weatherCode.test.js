import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { resolveWeatherCode, normalizeForecast } from '../src/utils/weatherCode.js'

const codes = {
  '0': 'Ясно',
  '2': 'Переменная облачность',
  '3': 'Пасмурно',
  '61': 'Дождь'
}

describe('resolveWeatherCode', () => {
  it('returns mapped label for known code', () => {
    assert.equal(resolveWeatherCode(3, codes), 'Пасмурно')
    assert.equal(resolveWeatherCode('61', codes), 'Дождь')
  })

  it('returns fallback for unknown code', () => {
    assert.equal(resolveWeatherCode(99, codes), 'Код 99')
  })

  it('handles null/undefined', () => {
    assert.equal(resolveWeatherCode(null, codes), 'Нет данных')
    assert.equal(resolveWeatherCode(undefined, codes), 'Нет данных')
  })
})

describe('normalizeForecast', () => {
  it('maps current and daily fields', () => {
    const raw = {
      current: {
        temperature_2m: 12.4,
        weather_code: 3,
        wind_speed_10m: 4.8
      },
      daily: {
        time: ['2026-09-16', '2026-09-17'],
        temperature_2m_max: [15, 16],
        temperature_2m_min: [7, 8],
        weather_code: [3, 61]
      }
    }
    const result = normalizeForecast(raw, codes)
    assert.equal(result.current.temperature, 12.4)
    assert.equal(result.current.label, 'Пасмурно')
    assert.equal(result.daily.length, 2)
    assert.equal(result.daily[1].label, 'Дождь')
  })

  it('throws when current/daily missing', () => {
    assert.throws(() => normalizeForecast({}, codes), /отсутствуют ожидаемые поля/)
  })
})
