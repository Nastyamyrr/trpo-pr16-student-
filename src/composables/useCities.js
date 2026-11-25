import { ref } from 'vue'

export function useCities() {
  const cities = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadCities() {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/dataset/cities.csv')
      if (!res.ok) throw new Error(`cities.csv: HTTP ${res.status}`)
      const text = await res.text()
      cities.value = parseCsv(text)
    } catch (e) {
      error.value = e.message
      cities.value = []
    } finally {
      loading.value = false
    }
  }

  function parseCsv(text) {
    const lines = text
      .replace(/^\uFEFF/, '')
      .trim()
      .split(/\r?\n/)
      .filter(Boolean)

    if (lines.length < 2) return []

    const headers = lines[0].split(';').map((h) => h.trim().toLowerCase())
    const nameIdx = headers.indexOf('name')
    const latIdx = headers.indexOf('latitude')
    const lonIdx = headers.indexOf('longitude')
    const tzIdx = headers.indexOf('timezone')

    return lines
      .slice(1)
      .map((line, i) => {
        const cols = line.split(';')
        return {
          id: i + 1,
          name: cols[nameIdx]?.trim() ?? `Город ${i + 1}`,
          latitude: Number(cols[latIdx]),
          longitude: Number(cols[lonIdx]),
          timezone: cols[tzIdx]?.trim() ?? 'UTC'
        }
      })
      .filter((c) => !Number.isNaN(c.latitude) && !Number.isNaN(c.longitude))
  }

  return { cities, loading, error, loadCities }
}
