// Framework-agnostic seen-set for the "make it automatic?" prompt —
// each (categoryId, amount) pair prompts at most once per calendar month.

const SEEN_KEY = 'TRACERO_RECURRING_PROMPTS'

interface SeenData {
  month: string
  keys: string[]
}

const currentMonthTag = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}`
}

const load = (): SeenData => {
  try {
    const raw = localStorage.getItem(SEEN_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.month === currentMonthTag() && Array.isArray(parsed.keys)) {
        return parsed
      }
    }
  } catch {
    // unreadable — treat as fresh month
  }
  return { month: currentMonthTag(), keys: [] }
}

export const promptKey = (categoryId: string, amount: number): string =>
  `${categoryId}|${amount}`

export const wasPromptShown = (key: string): boolean => load().keys.includes(key)

export const markPromptShown = (key: string): void => {
  try {
    const data = load()
    if (!data.keys.includes(key)) data.keys.push(key)
    localStorage.setItem(SEEN_KEY, JSON.stringify(data))
  } catch {
    // storage unavailable — prompt may repeat, harmless
  }
}
