/** Format a number as AUD currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a date string (YYYY-MM-DD) for display in Australia/Sydney timezone */
export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Return tailwind classes for urgency level */
export function urgencyBadgeClasses(urgency: 'red' | 'amber' | 'green'): string {
  return {
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
  }[urgency]
}
