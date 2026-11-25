<script setup>
defineProps({
  days: { type: Array, default: () => [] }
})

const dayLabels = ['Сегодня', 'Завтра', 'Далее']

function labelFor(index) {
  return dayLabels[index] ?? `День ${index + 1}`
}
</script>

<template>
  <div class="forecast-grid">
    <div
      v-for="(day, index) in days"
      :key="day.date || index"
      class="forecast-card"
    >
      <div class="day">{{ labelFor(index) }}</div>
      <div class="range">
        {{ Math.round(day.max) }} / {{ Math.round(day.min) }}°C
      </div>
      <div class="code">{{ day.label }}</div>
    </div>
  </div>
</template>
