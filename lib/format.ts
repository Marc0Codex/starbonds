export const CURRENCIES = ["USD", "MXN", "CRC", "COP", "CLP", "PEN", "ARS", "EUR"] as const

// Prices are stored in minor units (cents).
export function formatPrice(cents: number, currency: string, locale: string) {
  const amount = cents / 100
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}
