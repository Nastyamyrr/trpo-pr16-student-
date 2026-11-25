# Результаты test_cases.json

| case | expected | result | comment |
|------|----------|--------|---------|
| select_city | forecast_visible | **pass** | Выбор города → fetch/cache → CurrentWeather + ForecastList |
| api_error | error_message | **pass** | HTTP-ошибка / abort → error, последний успех сохраняется (isStale) |
| favorite_add | persisted | **pass** | useFavorites + localStorage; unit-тест `favorites.test.js` |
| unknown_weather_code | fallback_label | **pass** | `resolveWeatherCode(99)` → `Код 99`; тест `weatherCode.test.js` |

Автотесты: `npm test` (node:test).

```
tests/weatherCode.test.js  — weather code + normalize
tests/cache.test.js         — TTL / fresh / expired
tests/favorites.test.js     — add / toggle / no duplicate
tests/apiNormalize.test.js  — mock payload + unknown code
```
