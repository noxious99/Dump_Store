import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { getCurrencySymbol, formatMoney } from '@/utils/currency'

/**
 * The user's preferred currency, sourced from the user slice
 * (token on login/signup, localStorage cache before that).
 */
export const useCurrency = () => {
  const currency = useSelector((state: RootState) => state.user.currency)
  return {
    currency,
    symbol: getCurrencySymbol(currency),
    format: (amount: number) => formatMoney(amount, currency),
  }
}
