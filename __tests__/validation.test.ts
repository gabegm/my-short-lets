import { describe, it, expect } from 'vitest'
import { bookingRequestSchema, propertySchema } from '../src/lib/validation'

describe('bookingRequestSchema', () => {
  it('validates a complete valid request', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      guestPhone: '555-0123',
      checkIn: '2026-07-15',
      checkOut: '2026-07-20',
      guestsCount: 2,
      message: 'We\'d love to bring our dog.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing guest name', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: '',
      guestEmail: 'john@example.com',
      checkIn: '2026-07-15',
      checkOut: '2026-07-20',
      guestsCount: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: 'John',
      guestEmail: 'not-an-email',
      checkIn: '2026-07-15',
      checkOut: '2026-07-20',
      guestsCount: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects check-out before check-in', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: 'John',
      guestEmail: 'john@example.com',
      checkIn: '2026-07-20',
      checkOut: '2026-07-15',
      guestsCount: 1,
    })
    expect(result.success).toBe(false)
  })

  it('rejects zero or negative guests', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: 'John',
      guestEmail: 'john@example.com',
      checkIn: '2026-07-15',
      checkOut: '2026-07-20',
      guestsCount: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields as empty strings', () => {
    const result = bookingRequestSchema.safeParse({
      guestName: 'John',
      guestEmail: 'john@example.com',
      guestPhone: '',
      checkIn: '2026-07-15',
      checkOut: '2026-07-20',
      guestsCount: 1,
      message: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('propertySchema', () => {
  it('validates a complete valid property', () => {
    const result = propertySchema.safeParse({
      name: 'Cozy Downtown Loft',
      slug: 'cozy-downtown-loft',
      description: 'A beautiful loft in the city center.',
      pricePerNight: 150,
      maxGuests: 4,
      amenities: ['WiFi', 'Kitchen', 'Parking'],
      houseRules: 'No smoking, no pets.',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      isActive: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = propertySchema.safeParse({
      name: '',
      slug: 'test',
      description: 'Test',
      pricePerNight: 100,
      maxGuests: 2,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid slug', () => {
    const result = propertySchema.safeParse({
      name: 'Test',
      slug: 'Invalid Slug!',
      description: 'Test',
      pricePerNight: 100,
      maxGuests: 2,
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative price', () => {
    const result = propertySchema.safeParse({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      pricePerNight: -10,
      maxGuests: 2,
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional iCal URLs', () => {
    const result = propertySchema.safeParse({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      pricePerNight: 100,
      maxGuests: 2,
      airbnbIcalUrl: 'https://example.com/calendar.ics',
      bookingComIcalUrl: 'https://example.com/calendar.ics',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty iCal URLs', () => {
    const result = propertySchema.safeParse({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      pricePerNight: 100,
      maxGuests: 2,
      airbnbIcalUrl: '',
      bookingComIcalUrl: '',
    })
    expect(result.success).toBe(true)
  })
})
