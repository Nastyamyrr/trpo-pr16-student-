/**
 * Преобразование weather_code в человекочитаемую подпись.
 * Неизвестный код → fallback, без падения.
 */
export function resolveWeatherCode(code, codesMap = {}) {
  if (code === null || code === undefined) {
    return 'Нет данных'
  }
  const key = String(code)
  return codesMap[key] ?? `Код ${key}`
}

export function normalizeForecast(raw, codesMap = {}) {
  if (!raw?.current || !raw?.daily) {
    throw new Error('В ответе отсутствуют ожидаемые поля current / daily')
  }

  const currentCode = raw.current.weather_code
  const days = (raw.daily.time || []).map((date, i) => {
    const code = raw.daily.weather_code?.[i]
    return {
      date,
      max: raw.daily.temperature_2m_max?.[i],
      min: raw.daily.temperature_2m_min?.[i],
      weather_code: code,
      label: resolveWeatherCode(code, codesMap)
    }
  })

  return {
    current: {
      temperature: raw.current.temperature_2m,
      weather_code: currentCode,
      wind_speed: raw.current.wind_speed_10m,
      label: resolveWeatherCode(currentCode, codesMap)
    },
    daily: days
  }
}
