<script setup>
defineProps({
  cityName: { type: String, default: '' },
  data: { type: Object, required: true }
})
</script>

<template>
  <div class="weather-main">
    <div class="city-name">{{ cityName }}</div>
    <div class="temp">{{ Math.round(data.temperature) }}°C</div>
    <div class="condition">{{ data.label }}</div>
    <div class="wind">ветер {{ data.wind_speed }} м/с</div>
  </div>
</template>
