/**
 * Format a date string to Estonian locale format (dd.mm.yyyy)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
