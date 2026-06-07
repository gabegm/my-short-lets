import { describe, it, expect } from 'vitest'
import { parseIcsContent, eventsToBlocks, dateToIso } from '../src/lib/ical'

const validIcsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb//EN
BEGIN:VEVENT
UID:test1@airbnb.com
DTSTART:20260715
DTEND:20260720
SUMMARY:Booked
END:VEVENT
BEGIN:VEVENT
UID:test2@airbnb.com
DTSTART:20260801T140000Z
DTEND:20260805T110000Z
SUMMARY:Booked
END:VEVENT
END:VCALENDAR`

const malformedIcsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:bad1@airbnb.com
DTSTART:20260715
DTEND:20260720
END:VEVENT
BEGIN:VEVENT
UID:bad2@airbnb.com
END:VEVENT
BEGIN:VEVENT
UID:bad3@airbnb.com
DTSTART:invalid-date
DTEND:also-invalid
END:VEVENT
END:VCALENDAR`

describe('parseIcsContent', () => {
  it('parses valid date-only events', () => {
    const events = parseIcsContent(validIcsContent)
    expect(events).toHaveLength(2)
    expect(events[0].startDate).toEqual(new Date(2026, 6, 15)) // July 15
    expect(events[0].endDate).toEqual(new Date(2026, 6, 20)) // July 20
  })

  it('parses valid datetime events', () => {
    const events = parseIcsContent(validIcsContent)
    expect(events[1].startDate).toEqual(new Date('2026-08-01T14:00:00Z'))
    expect(events[1].endDate).toEqual(new Date('2026-08-05T11:00:00Z'))
  })

  it('skips events without DTEND', () => {
    const events = parseIcsContent(malformedIcsContent)
    // parseIcsContent returns all events with DTSTART (even without DTEND)
    // eventsToBlocks filters out those without DTEND
    expect(events).toHaveLength(2) // First event (valid) + second event (no DTEND)
    const blocks = eventsToBlocks(events)
    expect(blocks).toHaveLength(1) // Only the first event has a valid DTEND
  })

  it('handles empty content', () => {
    const events = parseIcsContent('')
    expect(events).toHaveLength(0)
  })

  it('handles content with no events', () => {
    const events = parseIcsContent('BEGIN:VCALENDAR\nEND:VCALENDAR')
    expect(events).toHaveLength(0)
  })
})

describe('eventsToBlocks', () => {
  it('converts events to date blocks', () => {
    const events = parseIcsContent(validIcsContent)
    const blocks = eventsToBlocks(events)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].startDate).toBe('2026-07-15')
    expect(blocks[0].endDate).toBe('2026-07-19') // exclusive → inclusive
    expect(blocks[1].startDate).toBe('2026-08-01')
    expect(blocks[1].endDate).toBe('2026-08-04')
  })

  it('filters out invalid ranges', () => {
    const events = parseIcsContent(malformedIcsContent)
    const blocks = eventsToBlocks(events)
    expect(blocks).toHaveLength(1)
  })
})

describe('dateToIso', () => {
  it('converts date to ISO string', () => {
    expect(dateToIso(new Date(2026, 6, 15))).toBe('2026-07-15')
    expect(dateToIso(new Date(2026, 0, 1))).toBe('2026-01-01')
    expect(dateToIso(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})
