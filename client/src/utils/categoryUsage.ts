// Framework-agnostic category-usage ranking for the expense adder.
// Backs the tile-grid ordering and last-used default. localStorage is
// wrapped in try/catch so storage failures degrade to default ordering.
// Counts halve on the first write of each calendar month so the ranking
// stays fresh without any scheduled job.

const USAGE_KEY = 'TRACERO_CATEGORY_USAGE'

interface UsageData {
  counts: Record<string, number>
  lastUsed: string | null
  month: string
}

const currentMonthTag = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}`
}

const emptyData = (): UsageData => ({
  counts: {},
  lastUsed: null,
  month: currentMonthTag(),
})

const load = (): UsageData => {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.counts) {
        return parsed as UsageData
      }
    }
  } catch {
    // unreadable storage — start fresh
  }
  return emptyData()
}

const save = (data: UsageData): void => {
  try {
    localStorage.setItem(USAGE_KEY, JSON.stringify(data))
  } catch {
    // storage unavailable — ranking just won't persist
  }
}

const withMonthlyDecay = (data: UsageData): UsageData => {
  const tag = currentMonthTag()
  if (data.month === tag) return data
  const counts: Record<string, number> = {}
  for (const [id, n] of Object.entries(data.counts)) {
    const halved = Math.floor(n / 2)
    if (halved > 0) counts[id] = halved
  }
  return { ...data, counts, month: tag }
}

export const recordCategoryUse = (categoryId: string): void => {
  const data = withMonthlyDecay(load())
  data.counts[categoryId] = (data.counts[categoryId] ?? 0) + 1
  data.lastUsed = categoryId
  save(data)
}

/** Category ids sorted by usage, most-used first. Unknown ids simply won't appear. */
export const getCategoryRanking = (): string[] => {
  const data = withMonthlyDecay(load())
  return Object.entries(data.counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
}

export const getLastUsedCategory = (): string | null => load().lastUsed
