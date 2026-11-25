<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCities } from './composables/useCities.js'
import { useWeather } from './composables/useWeather.js'
import { useFavorites } from './composables/useFavorites.js'
import CitySelector from './components/CitySelector.vue'
import CurrentWeather from './components/CurrentWeather.vue'
import ForecastList from './components/ForecastList.vue'

const { cities, loading: citiesLoading, error: citiesError, loadCities } = useCities()
const {
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
  clear
} = useWeather()
const { favorites, isFavorite, toggleFavorite } = useFavorites()

const selectedCity = ref(null)
const apiFields = ref({ current: [], daily: [] })
const weatherCodes = ref({})

/** computed: избранное ли текущий город */
const selectedIsFavorite = computed(() => isFavorite(selectedCity.value))

/** computed: подпись источника данных */
const sourceLabel = computed(() => {
  if (fromCache.value) return 'из кэша'
  if (offlineMode.value) return 'mock'
  return 'API'
})

onMounted(async () => {
  await Promise.all([loadCities(), loadApiFields(), loadWeatherCodes()])
})

async function loadApiFields() {
  try {
    const res = await fetch('/dataset/api_fields.json')
    if (!res.ok) throw new Error()
    apiFields.value = await res.json()
  } catch {
    apiFields.value = {
      current: ['temperature_2m', 'weather_code', 'wind_speed_10m'],
      daily: ['weather_code', 'temperature_2m_max', 'temperature_2m_min']
    }
  }
}

async function loadWeatherCodes() {
  try {
    const res = await fetch('/dataset/weather_codes.json')
    if (!res.ok) throw new Error()
    weatherCodes.value = await res.json()
  } catch {
    weatherCodes.value = {
      '0': 'Ясно',
      '1': 'Преимущественно ясно',
      '2': 'Переменная облачность',
      '3': 'Пасмурно',
      '61': 'Дождь'
    }
  }
}

async function loadWeather(force = false) {
  if (!selectedCity.value) {
    clear()
    return
  }
  await fetchWeather(selectedCity.value, apiFields.value, weatherCodes.value, { force })
}

function onCityChange(city) {
  selectedCity.value = city
  loadWeather(false)
}

function selectFavorite(city) {
  // Найти полный объект в cities по координатам (для id)
  const full =
    cities.value.find(
      (c) => c.latitude === city.latitude && c.longitude === city.longitude
    ) || city
  selectedCity.value = full
  loadWeather(false)
}

function toggleOffline() {
  setOfflineMode(!offlineMode.value)
  if (selectedCity.value) loadWeather(true)
}

function formatTime(date) {
  if (!date) return '—'
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const ttlMinutes = Math.round(CACHE_TTL_MS / 60000)
</script>

<template>
  <header>
    <div class="brand">Практическая работа 16</div>
    <span>ТРПО · итоговый Weather Manager</span>
  </header>

  <div class="wrap">
    <div class="hero">
      <span class="pill">кэш · избранное · AbortController · тесты</span>
      <h1>Погодный менеджер (итоговый)</h1>
      <p class="muted">
        TTL кэша: <strong>{{ ttlMinutes }} мин</strong>.
        Повторный выбор города не создаёт новый запрос, пока запись актуальна.
      </p>

      <div class="controls">
        <CitySelector
          :cities="cities"
          :model-value="selectedCity"
          :disabled="loading || citiesLoading"
          @update:model-value="onCityChange"
        />

        <button
          class="btn"
          :disabled="loading || !selectedCity"
          @click="loadWeather(true)"
        >
          {{ loading ? 'Загрузка…' : 'Обновить' }}
        </button>

        <button
          class="btn fav"
          :class="{ active: selectedIsFavorite }"
          :disabled="!selectedCity"
          @click="toggleFavorite(selectedCity)"
        >
          {{ selectedIsFavorite ? '★ В избранном' : '☆ В избранное' }}
        </button>

        <button
          class="btn secondary"
          :class="{ active: offlineMode }"
          :disabled="loading"
          @click="toggleOffline"
        >
          {{ offlineMode ? 'Offline (mock)' : 'Online (API)' }}
        </button>
      </div>

      <div class="meta" v-if="lastUpdated">
        Обновлено: {{ formatTime(lastUpdated) }}
        · источник: {{ sourceLabel }}
        <span v-if="fromCache"> · без нового запроса</span>
      </div>

      <div class="meta" v-if="citiesError" style="color: #991b1b">
        Ошибка городов: {{ citiesError }}
      </div>

      <!-- Избранные -->
      <div class="favorites" v-if="favorites.length">
        <span class="muted" style="margin: 0; align-self: center">Избранное:</span>
        <button
          v-for="fav in favorites"
          :key="`${fav.latitude}-${fav.longitude}`"
          class="fav-chip"
          :class="{
            selected:
              selectedCity &&
              selectedCity.latitude === fav.latitude &&
              selectedCity.longitude === fav.longitude
          }"
          @click="selectFavorite(fav)"
        >
          {{ fav.name }}
        </button>
      </div>
    </div>

    <!-- Состояния -->
    <div v-if="loading && !hasData" class="state-box loading">
      Загрузка погоды…
    </div>

    <div v-else-if="error && !hasData" class="state-box error">
      <strong>Ошибка:</strong> {{ error }}
      <div class="hint">Проверьте сеть или включите Offline (mock).</div>
      <div style="margin-top: 14px">
        <button class="btn" :disabled="!selectedCity" @click="loadWeather(true)">
          Повторить
        </button>
      </div>
    </div>

    <div v-else-if="!selectedCity" class="state-box empty">
      Выберите город, чтобы загрузить погоду.
    </div>

    <div v-else-if="hasData" class="weather-panel" :class="{ stale: isStale }">
      <div v-if="isStale" class="stale-banner">
        Показаны последние успешные данные (устарели).
        Ошибка обновления: {{ error }}
      </div>
      <div v-if="fromCache" style="margin-bottom: 12px">
        <span class="pill cache">данные из кэша</span>
      </div>
      <div class="weather-top">
        <CurrentWeather
          :city-name="selectedCity.name"
          :data="weather.current"
        />
        <ForecastList :days="weather.daily" />
      </div>
    </div>

    <div v-else class="state-box empty">
      Нет данных для отображения.
    </div>
  </div>
</template>
