# Практическая работа №16  
## Vue погодный менеджер. Оптимизация, сохранение настроек, тестирование и итоговая проверка

**Дисциплина:** Технологии разработки программного обеспечения  
**Преподаватель:** Макиевский Станислав Евгеньевич  
**Семестр:** 3 семестр, 2026-2027 гг.

---

## Краткое описание

Итоговый **Vue Weather Manager** на Composition API:

- Open-Meteo API + offline mock;
- **избранные города** (localStorage);
- **кэш с TTL 5 минут** — повторный выбор города без нового запроса;
- **AbortController** — защита от гонки при быстром переключении;
- сохранение последнего успешного прогноза при временной ошибке (`isStale`);
- ≥4 автоматизированных теста;
- отчёты по `test_cases.json`, `cache_cases.json`, `quality_checklist.csv`.

---

## Технологии

- Vue 3.5+ (Composition API, `<script setup>`, computed)
- Vite 6
- Fetch + `URL` / `URLSearchParams` + `AbortController`
- Node.js native test runner (`node --test`)
- Open-Meteo Forecast API

---

## Запуск

```bash
cd trpo-pr16-weather-manager
npm install
npm run dev          # http://localhost:5173
npm test             # unit-тесты
npm run build
npm run preview      # production preview
```

---

## Структура

```
trpo-pr16-weather-manager/
├── public/dataset/
│   ├── cities.csv
│   ├── api_fields.json
│   ├── weather_codes.json
│   ├── mock_forecast.json
│   ├── test_cases.json
│   ├── cache_cases.json
│   └── quality_checklist.csv
├── src/
│   ├── components/     CitySelector, CurrentWeather, ForecastList
│   ├── composables/    useCities, useWeather, useFavorites
│   ├── utils/          cache.js, weatherCode.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── tests/              4 unit-test файла
├── docs/               test-results, cache-results, checklist
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## Архитектура

```
App.vue
  ├── useCities()        → cities.csv
  ├── useFavorites()     → localStorage
  ├── useWeather()       → cache + fetch + AbortController
  │     ├── utils/cache.js
  │     └── utils/weatherCode.js
  ├── CitySelector
  ├── CurrentWeather
  └── ForecastList
```

**Маршрут данных:**

```
cities.csv → CitySelector → selectedCity (lat/lon)
     ↓
cache hit? → показать сразу (fromCache)
     ↓ miss
AbortController + fetch (API | mock)
     ↓
normalizeForecast + weather_codes → UI
     ↓
saveCache (TTL 5 min)
```

---

## Стратегия кэша

| Параметр | Значение |
|----------|----------|
| TTL | **5 минут** (`CACHE_TTL_MS`) |
| Ключ | `lat,lon` (4 знака) |
| Хранилище | in-memory `Map` |
| Fresh | повторный выбор → **без** Network-запроса |
| Expired | новый fetch + обновление записи |
| Manual refresh | кнопка «Обновить» → `force: true` |

Почему 5 минут: погодные данные меняются не каждую секунду; 5 мин достаточно, чтобы убрать лишние запросы при переключении городов на защите, и при этом не показывать совсем устаревшие значения.

---

## API-поля (api_fields.json)

**current:** `temperature_2m`, `weather_code`, `wind_speed_10m`  
**daily:** `weather_code`, `temperature_2m_max`, `temperature_2m_min`

Пример URL:

```
https://api.open-meteo.com/v1/forecast
  ?latitude=55.7558&longitude=37.6176
  &current=temperature_2m,weather_code,wind_speed_10m
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &timezone=auto&forecast_days=3
```

---

## Избранное

Composable `useFavorites`:

- чтение/запись `localStorage` ключ `trpo-pr16-favorites`;
- `add` / `remove` / `toggle` / `isFavorite`;
- чипы избранных в UI для быстрого выбора.

---

## Обработка ошибок

1. Город не выбран → empty state  
2. HTTP / сеть → error; **последний успешный прогноз остаётся** (`isStale = true`)  
3. Битый JSON / нет `current|daily` → error  
4. Быстрое переключение городов → старый ответ отменяется (`AbortController`)

---

## Тесты

```bash
npm test
```

| Файл | Что проверяет |
|------|----------------|
| `weatherCode.test.js` | маппинг кодов, fallback, normalize |
| `cache.test.js` | fresh / expired / TTL / save |
| `favorites.test.js` | add, no-duplicate, toggle |
| `apiNormalize.test.js` | mock payload, unknown code |

Отчёты: `docs/test-results.md`, `docs/cache-results.md`, `docs/quality_checklist_filled.csv`.

---

## Что показать на защите

1. `npm install && npm run dev` с нуля  
2. Выбор города → один запрос в Network  
3. Повторный выбор того же города → **нет** нового запроса, pill «данные из кэша»  
4. «Обновить» → новый запрос  
5. Избранное сохраняется после перезагрузки страницы  
6. Offline mock  
7. `npm test` — все зелёные  
8. `npm run build && npm run preview`
