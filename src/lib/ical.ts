/**
 * iCal parser — extracts date ranges from .ics file content.
 * Handles VEVENT components with DTSTART and DTEND properties.
 * Supports both date-only and datetime values.
 */

interface IcsEvent {
  startDate: Date
  endDate: Date
}

interface ParsedBlock {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD (exclusive)
}

/**
 * Parse .ics file content into an array of events.
 * Handles malformed events gracefully (skips them).
 */
export function parseIcsContent(content: string): IcsEvent[] {
  const events: IcsEvent[] = []
  const lines = content.split(/\r?\n/)

  let inEvent = false
  let startDate: Date | null = null
  let endDate: Date | null = null

  for (const line of lines) {
    // Unfold continuation lines (lines starting with space/tab)
    const unfolded = line.replace(/^\s+/, '')

    if (unfolded === 'BEGIN:VEVENT') {
      inEvent = true
      startDate = null
      endDate = null
      continue
    }

    if (unfolded === 'END:VEVENT') {
      if (inEvent && startDate && endDate) {
        events.push({ startDate, endDate })
      }
      inEvent = false
      continue
    }

    if (!inEvent) continue

    // Parse DTSTART
    if (unfolded.startsWith('DTSTART')) {
      const value = unfoldProperty(unfolded).split(':').slice(1).join(':').trim()
      startDate = parseIcsDate(value)
      continue
    }

    // Parse DTEND
    if (unfolded.startsWith('DTEND')) {
      const value = unfoldProperty(unfolded).split(':').slice(1).join(':').trim()
      endDate = parseIcsDate(value)
      continue
    }
  }

  return events
}

/**
 * Convert events to date-only blocks (for booking availability).
 * end_date is exclusive (the night of end_date is available).
 */
export function eventsToBlocks(events: IcsEvent[]): ParsedBlock[] {
  return events
    .filter((e) => e.startDate && e.endDate)
    .map((e) => ({
      startDate: dateToIso(e.startDate),
      endDate: dateToIso(addDays(e.endDate, -1)), // exclusive → make inclusive for blocking
    }))
    .filter((b) => b.startDate <= b.endDate) // skip invalid ranges
}

/**
 * Parse an iCal date/datetime value into a JavaScript Date.
 * Handles:
 *   - Date-only: 20260715
 *   - Datetime UTC: 20260715T000000Z
 *   - Datetime with timezone: 20260715T150000+0200
 */
function parseIcsDate(value: string): Date {
  // Date-only: YYYYMMDD
  if (/^\d{8}$/.test(value)) {
    const year = parseInt(value.slice(0, 4), 10)
    const month = parseInt(value.slice(4, 6), 10) - 1
    const day = parseInt(value.slice(6, 8), 10)
    return new Date(year, month, day)
  }

  // Datetime with Z (UTC)
  if (/Z$/.test(value)) {
    const withoutZ = value.replace(/Z$/, '')
    // Format: YYYYMMDDTHHMMSSZ → YYYY-MM-DDTHH:MM:SSZ
    const formatted = `${withoutZ.slice(0, 4)}-${withoutZ.slice(4, 6)}-${withoutZ.slice(6, 8)}T${withoutZ.slice(9, 11)}:${withoutZ.slice(11, 13)}:${withoutZ.slice(13, 15)}Z`
    return new Date(formatted)
  }

  // Datetime with timezone offset
  const tzMatch = value.match(/(\d{2})(\d{2})(\d{2})([+-]\d{4})$/)
  if (tzMatch) {
    const base = value.slice(0, tzMatch.index)
    const tz = tzMatch[4]
    // Format: YYYYMMDDTHHMMSS+0200 → YYYY-MM-DDTHH:MM:SS+0200
    const formatted = `${base.slice(0, 4)}-${base.slice(4, 6)}-${base.slice(6, 8)}T${base.slice(9, 11)}:${base.slice(11, 13)}:${base.slice(13, 15)}${tz}`
    return new Date(formatted)
  }

  // Fallback: try to parse as-is
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return new Date(0) // invalid, will be filtered out
  }
  return date
}

/**
 * Convert a Date to ISO date string (YYYY-MM-DD).
 */
export function dateToIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Add N days to a Date.
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Unfold an iCal property value (handle line folding).
 */
function unfoldProperty(line: string): string {
  return line.replace(/;\r?\n[ \t]/g, '')
}
