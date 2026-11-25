# Результаты cache_cases.json

TTL = **5 минут** (`CACHE_TTL_MS = 5 * 60 * 1000`).

| case | age_seconds | request_expected | result | comment |
|------|-------------|------------------|--------|---------|
| fresh | 30 | false | **pass** | `getCached` возвращает данные, Network без нового запроса |
| expired | 600 | true | **pass** | запись старше TTL удаляется → новый fetch |
| manual_refresh | 30 | true | **pass** | кнопка «Обновить» вызывает `fetchWeather(..., { force: true })` |

Проверка вручную:

1. Выбрать город → один запрос в Network.
2. Выбрать тот же город снова (в пределах 5 мин) → запроса нет, pill «данные из кэша».
3. Нажать «Обновить» → новый запрос даже при свежем кэше.
