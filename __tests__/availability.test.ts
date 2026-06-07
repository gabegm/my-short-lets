import { describe, it, expect } from 'vitest'

function datesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  // Two ranges overlap if one starts before the other ends and vice versa
  return startA < endB && startB < endA
}

function getAvailableNights(
  propertyId: string,
  startDate: string,
  endDate: string,
  blockedRanges: { startDate: string; endDate: string }[],
): string[] {
  const available: string[] = []
  let current = new Date(startDate)
  const end = new Date(endDate)

  while (current < end) {
    const dateStr = current.toISOString().split('T')[0]
    const isBlocked = blockedRanges.some(
      (block) => dateStr >= block.startDate && dateStr < block.endDate,
    )
    if (!isBlocked) {
      available.push(dateStr)
    }
    current.setDate(current.getDate() + 1)
  }

  return available
}

describe('datesOverlap', () => {
  it('returns true for exact match', () => {
    expect(datesOverlap('2026-07-15', '2026-07-20', '2026-07-15', '2026-07-20')).toBe(true)
  })

  it('returns true for partial overlap (A starts inside B)', () => {
    expect(datesOverlap('2026-07-18', '2026-07-22', '2026-07-15', '2026-07-20')).toBe(true)
  })

  it('returns true for partial overlap (B starts inside A)', () => {
    expect(datesOverlap('2026-07-15', '2026-07-20', '2026-07-18', '2026-07-22')).toBe(true)
  })

  it('returns false for no overlap (A before B)', () => {
    expect(datesOverlap('2026-07-10', '2026-07-15', '2026-07-20', '2026-07-25')).toBe(false)
  })

  it('returns false for no overlap (B before A)', () => {
    expect(datesOverlap('2026-07-20', '2026-07-25', '2026-07-10', '2026-07-15')).toBe(false)
  })

  it('returns true for B entirely within A', () => {
    expect(datesOverlap('2026-07-10', '2026-07-25', '2026-07-15', '2026-07-20')).toBe(true)
  })
})

describe('getAvailableNights', () => {
  it('returns all nights when no blocks', () => {
    const result = getAvailableNights('prop1', '2026-07-15', '2026-07-20', [])
    expect(result).toEqual(['2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19'])
  })

  it('excludes blocked nights', () => {
    const blocks = [{ startDate: '2026-07-17', endDate: '2026-07-19' }]
    const result = getAvailableNights('prop1', '2026-07-15', '2026-07-20', blocks)
    expect(result).toEqual(['2026-07-15', '2026-07-16', '2026-07-19'])
  })

  it('returns empty when all nights blocked', () => {
    const blocks = [{ startDate: '2026-07-15', endDate: '2026-07-20' }]
    const result = getAvailableNights('prop1', '2026-07-15', '2026-07-20', blocks)
    expect(result).toEqual([])
  })

  it('handles multiple non-overlapping blocks', () => {
    const blocks = [
      { startDate: '2026-07-15', endDate: '2026-07-17' },
      { startDate: '2026-07-19', endDate: '2026-07-20' },
    ]
    const result = getAvailableNights('prop1', '2026-07-15', '2026-07-20', blocks)
    // 2026-07-19 is blocked by the second block (endDate is exclusive in the range, so 07-19 is blocked)
    expect(result).toEqual(['2026-07-17', '2026-07-18'])
  })
})
