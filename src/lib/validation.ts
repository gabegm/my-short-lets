import { z } from 'zod'

export const bookingRequestSchema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().optional().or(z.literal('')),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guestsCount: z.coerce.number().int().min(1, 'At least 1 guest'),
  message: z.string().optional().or(z.literal('')),
}).refine(
  (data) => {
    const checkIn = new Date(data.checkIn)
    const checkOut = new Date(data.checkOut)
    return checkOut > checkIn
  },
  { message: 'Check-out date must be after check-in date' },
)

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>

export const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug must be lowercase, numbers, and hyphens only'),
  description: z.string().min(1, 'Description is required'),
  pricePerNight: z.coerce.number().positive('Price must be positive'),
  maxGuests: z.coerce.number().int().min(1, 'At least 1 guest'),
  amenities: z.array(z.string()).default([]),
  houseRules: z.string().default(''),
  checkInTime: z.string().default('15:00'),
  checkOutTime: z.string().default('11:00'),
  isActive: z.coerce.boolean().default(true),
  airbnbIcalUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
  bookingComIcalUrl: z.string().url('Invalid URL').or(z.literal('')).optional(),
})

export type PropertyInput = z.infer<typeof propertySchema>
