// Framework-agnostic currency logic — no DOM/React imports so it ports to RN.
// Keep SUPPORTED_CURRENCIES in sync with server/services/userService.js.

export interface CurrencyInfo {
  code: string
  symbol: string
  label: string
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'BDT', symbol: '৳', label: 'Bangladeshi Taka' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', label: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee' },
  { code: 'SAR', symbol: '﷼', label: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham' },
  { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
  { code: 'BRL', symbol: 'R$', label: 'Brazilian Real' },
]

export const DEFAULT_CURRENCY = 'USD'

const REGION_TO_CURRENCY: Record<string, string> = {
  US: 'USD', BD: 'BDT', IN: 'INR', GB: 'GBP', JP: 'JPY', CN: 'CNY',
  CA: 'CAD', AU: 'AUD', PK: 'PKR', SA: 'SAR', AE: 'AED', MY: 'MYR',
  NG: 'NGN', BR: 'BRL',
  // Eurozone
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR',
}

export const isSupportedCurrency = (code: string | undefined | null): boolean =>
  !!code && SUPPORTED_CURRENCIES.some((c) => c.code === code)

export const getCurrencySymbol = (code: string | undefined | null): string =>
  SUPPORTED_CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'

/**
 * Infer a currency from a BCP-47 locale tag (e.g. "bn-BD" → BDT).
 * Pass `navigator.language` from web; RN can pass its own locale source.
 */
export const detectCurrencyFromLocale = (locale: string | undefined): string => {
  if (!locale) return DEFAULT_CURRENCY
  try {
    const region = new Intl.Locale(locale).maximize().region
    if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region]
  } catch {
    // unparseable locale — fall through to default
  }
  return DEFAULT_CURRENCY
}

/** Format an amount with the currency symbol, e.g. ৳1,250.50 */
export const formatMoney = (amount: number, code: string): string =>
  `${getCurrencySymbol(code)}${amount.toLocaleString()}`

// --- client-side cache so the symbol is correct on first paint ---

const CURRENCY_CACHE_KEY = 'TRACERO_CURRENCY'

export const getCachedCurrencyOrNull = (): string | null => {
  try {
    const cached = localStorage.getItem(CURRENCY_CACHE_KEY)
    return isSupportedCurrency(cached) ? cached : null
  } catch {
    return null
  }
}

export const getCachedCurrency = (): string =>
  getCachedCurrencyOrNull() ?? DEFAULT_CURRENCY

export const clearCachedCurrency = (): void => {
  try {
    localStorage.removeItem(CURRENCY_CACHE_KEY)
  } catch {
    // storage unavailable — nothing to clear
  }
}

export const setCachedCurrency = (code: string): void => {
  try {
    if (isSupportedCurrency(code)) localStorage.setItem(CURRENCY_CACHE_KEY, code)
  } catch {
    // storage unavailable — symbol falls back to default next load
  }
}
