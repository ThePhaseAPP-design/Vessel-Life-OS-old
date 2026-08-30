export interface ParsedSupplement {
  name: string
  dose: string
  schedule: string
}

/**
 * Parses pasted text into supplement rows. Since SuppCo's exact export
 * format isn't something we could verify, this is deliberately forgiving:
 * - Tries comma-separated first (most common CSV export shape)
 * - Falls back to tab-separated
 * - Falls back to "one supplement per line, name only" if neither has
 *   a consistent column count
 * Always returns a preview the user confirms before anything is saved.
 */
export function parseSupplementList(raw: string): ParsedSupplement[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return []

  const tryDelimited = (delimiter: string): ParsedSupplement[] | null => {
    const rows = lines.map((l) => l.split(delimiter).map((c) => c.trim()))
    const colCounts = rows.map((r) => r.length)
    const consistentCols = colCounts.every((c) => c === colCounts[0])
    if (!consistentCols || colCounts[0] < 2) return null

    // Detect a header row: if first row's first cell looks like a label
    // ("name", "supplement", "product") rather than a real value, skip it.
    let dataRows = rows
    const firstCellLower = rows[0][0].toLowerCase()
    if (['name', 'supplement', 'product', 'title'].includes(firstCellLower)) {
      dataRows = rows.slice(1)
    }

    return dataRows
      .filter((r) => r[0])
      .map((r) => ({
        name: r[0] || '',
        dose: r[1] || '',
        schedule: r[2] || '',
      }))
  }

  const commaResult = tryDelimited(',')
  if (commaResult && commaResult.length > 0) return commaResult

  const tabResult = tryDelimited('\t')
  if (tabResult && tabResult.length > 0) return tabResult

  // Fallback: one supplement per line, name only
  return lines.map((l) => ({ name: l, dose: '', schedule: '' }))
}
