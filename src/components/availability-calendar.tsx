'use client'

import { useState, useEffect } from 'react'

interface AvailabilityCalendarProps {
  propertyId: string
}

interface BlockedRange {
  startDate: string
  endDate: string
}

export function AvailabilityCalendar({ propertyId }: AvailabilityCalendarProps) {
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch blocked dates on mount
  useEffect(() => {
    async function fetchBlockedDates() {
      setLoading(true)
      try {
        const res = await fetch(`/api/properties/${propertyId}/availability`)
        const data = await res.json()
        setBlockedRanges(data.blockedRanges || [])
      } catch (e) {
        console.error('Failed to fetch availability:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchBlockedDates()
  }, [propertyId])

  // Check if a date is blocked
  const isBlocked = (dateStr: string): boolean => {
    return blockedRanges.some(
      (block) => dateStr >= block.startDate && dateStr < block.endDate,
    )
  }

  // Generate calendar grid for a month
  const generateCalendarDays = (year: number, month: number): { date: string; isBlocked: boolean; isCurrentMonth: boolean }[] => {
    const days: { date: string; isBlocked: boolean; isCurrentMonth: boolean }[] = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDayOfWeek = firstDay.getDay()

    // Padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      const padDate = new Date(year, month, 1 - (startDayOfWeek - i))
      days.push({
        date: padDate.toISOString().split('T')[0],
        isBlocked: false,
        isCurrentMonth: false,
      })
    }

    // Actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        isBlocked: isBlocked(dateStr),
        isCurrentMonth: true,
      })
    }

    return days
  }

  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const currentLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const currentDays = generateCalendarDays(viewYear, viewMonth)
  const weeks: typeof currentDays[] = []
  for (let i = 0; i < currentDays.length; i += 7) {
    weeks.push(currentDays.slice(i, i + 7))
  }

  const prevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 1, 1)
    setViewYear(prev.getFullYear())
    setViewMonth(prev.getMonth())
  }

  const nextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-3 max-w-[20rem]">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="text-gray-400 hover:text-gray-700 px-2">‹</button>
          <p className="text-sm font-medium">{currentLabel}</p>
          <button onClick={nextMonth} className="text-gray-400 hover:text-gray-700 px-2">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-gray-400 py-1">{d}</span>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <span
                key={wi * 7 + di}
                className={`py-1.5 rounded min-w-[2rem] h-10 flex items-center justify-center ${
                  day.isBlocked
                    ? 'bg-red-100 text-red-600 line-through'
                    : day.isCurrentMonth
                      ? 'hover:bg-green-100 cursor-pointer text-green-700'
                      : 'text-gray-300'
                }`}
              >
                {parseInt(day.date.split('-')[2], 10)}
              </span>
            )),
          )}
        </div>
      </div>

      {loading && <p className="text-center text-gray-500 text-sm">Loading availability...</p>}

      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 rounded"></span> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-100 rounded"></span> Booked
        </span>
      </div>
    </div>
  )
}
