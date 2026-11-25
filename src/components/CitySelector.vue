<script setup>
const props = defineProps({
  cities: { type: Array, default: () => [] },
  modelValue: { type: Object, default: null },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

function onChange(event) {
  const id = Number(event.target.value)
  const city = props.cities.find((c) => c.id === id) || null
  emit('update:modelValue', city)
}
</script>

<template>
  <select
    :value="modelValue?.id ?? ''"
    :disabled="disabled || !cities.length"
    @change="onChange"
  >
    <option value="" disabled>Выберите город</option>
    <option
      v-for="city in cities"
      :key="city.id"
      :value="city.id"
    >
      {{ city.name }}
    </option>
  </select>
</template>
