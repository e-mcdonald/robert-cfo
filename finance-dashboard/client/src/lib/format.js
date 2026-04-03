export function fmtCurrency(n, { decimals = 0 } = {}) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: decimals,
  }).format(n)
}

export function fmtAmount(n) {
  return fmtCurrency(Math.abs(n), { decimals: 2 })
}
