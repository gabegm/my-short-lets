/**
 * Mock data for local testing without Supabase.
 * Set USE_MOCK_DATA=true in .env.local to use this.
 */

export interface MockProperty {
  id: string
  name: string
  slug: string
  description: string
  price_per_night: number
  max_guests: number
  amenities: string[]
  house_rules: string
  check_in_time: string
  check_out_time: string
  is_active: boolean
  airbnb_ical_url: string | null
  booking_com_ical_url: string | null
  created_at: string
  updated_at: string
}

export interface MockPropertyImage {
  id: string
  property_id: string
  url: string
  display_order: number
  is_primary: boolean
}

export interface MockBlockedDate {
  id: string
  property_id: string
  start_date: string
  end_date: string
  source: string
  synced_at: string
}

export interface MockBookingRequest {
  id: string
  property_id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in: string
  check_out: string
  guests_count: number
  message: string
  status: string
  created_at: string
  updated_at: string
}

export const mockProperties: MockProperty[] = [
  {
    id: 'prop-1',
    name: 'Cozy Downtown Loft',
    slug: 'cozy-downtown-loft',
    description: 'A beautiful loft in the city center with skyline views. Perfect for couples or small families. Features exposed brick walls, hardwood floors, and a fully equipped kitchen.',
    price_per_night: 150,
    max_guests: 4,
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Air conditioning'],
    house_rules: 'No smoking. Quiet hours 10pm-8am. Self check-in with lockbox.',
    check_in_time: '15:00',
    check_out_time: '11:00',
    is_active: true,
    airbnb_ical_url: null,
    booking_com_ical_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prop-2',
    name: 'Beachside Cottage',
    slug: 'beachside-cottage',
    description: 'Steps from the sand. Perfect for a relaxing getaway. Features a private patio, outdoor shower, and stunning sunset views.',
    price_per_night: 200,
    max_guests: 2,
    amenities: ['WiFi', 'Kitchen', 'Beach access', 'Outdoor shower'],
    house_rules: 'No pets. Please remove shoes inside. Beach chairs provided.',
    check_in_time: '16:00',
    check_out_time: '10:00',
    is_active: true,
    airbnb_ical_url: null,
    booking_com_ical_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'prop-3',
    name: 'Mountain Cabin',
    slug: 'mountain-cabin',
    description: 'Rustic cabin with forest views and a stone fireplace. Great for hiking and stargazing. Sleeps up to 6 with two bedrooms.',
    price_per_night: 175,
    max_guests: 6,
    amenities: ['WiFi', 'Fireplace', 'Hiking trails', 'BBQ grill'],
    house_rules: 'Check-in self-service. Bring firewood. No parties or events.',
    check_in_time: '15:00',
    check_out_time: '11:00',
    is_active: true,
    airbnb_ical_url: null,
    booking_com_ical_url: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
]

export const mockPropertyImages: MockPropertyImage[] = [
  // Cozy Downtown Loft
  { id: 'img-1', property_id: 'prop-1', url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Loft', display_order: 0, is_primary: true },
  { id: 'img-2', property_id: 'prop-1', url: 'https://placehold.co/800x600/16213e/ffffff?text=Loft+2', display_order: 1, is_primary: false },
  { id: 'img-3', property_id: 'prop-1', url: 'https://placehold.co/800x600/0f3460/ffffff?text=Loft+3', display_order: 2, is_primary: false },
  // Beachside Cottage
  { id: 'img-4', property_id: 'prop-2', url: 'https://placehold.co/800x600/e94560/ffffff?text=Cottage', display_order: 0, is_primary: true },
  { id: 'img-5', property_id: 'prop-2', url: 'https://placehold.co/800x600/533483/ffffff?text=Cottage+2', display_order: 1, is_primary: false },
  // Mountain Cabin
  { id: 'img-6', property_id: 'prop-3', url: 'https://placehold.co/800x600/1a1a2e/ffffff?text=Cabin', display_order: 0, is_primary: true },
  { id: 'img-7', property_id: 'prop-3', url: 'https://placehold.co/800x600/16213e/ffffff?text=Cabin+2', display_order: 1, is_primary: false },
  { id: 'img-8', property_id: 'prop-3', url: 'https://placehold.co/800x600/0f3460/ffffff?text=Cabin+3', display_order: 2, is_primary: false },
]

export const mockBlockedDates: MockBlockedDate[] = [
  // Cozy Downtown Loft — some dates already blocked
  { id: 'block-1', property_id: 'prop-1', start_date: '2026-07-15', end_date: '2026-07-20', source: 'airbnb', synced_at: '2026-06-01T00:00:00Z' },
  { id: 'block-2', property_id: 'prop-1', start_date: '2026-12-24', end_date: '2026-12-31', source: 'booking_com', synced_at: '2026-06-01T00:00:00Z' },
  // Beachside Cottage
  { id: 'block-3', property_id: 'prop-2', start_date: '2026-08-01', end_date: '2026-08-05', source: 'airbnb', synced_at: '2026-06-01T00:00:00Z' },
  // Mountain Cabin
  { id: 'block-4', property_id: 'prop-3', start_date: '2026-10-10', end_date: '2026-10-15', source: 'manual', synced_at: '2026-06-01T00:00:00Z' },
  // Extra blocks for visible testing (next 3 months from June 2026)
  { id: 'block-5', property_id: 'prop-1', start_date: '2026-06-10', end_date: '2026-06-14', source: 'airbnb', synced_at: '2026-06-01T00:00:00Z' },
  { id: 'block-6', property_id: 'prop-2', start_date: '2026-06-20', end_date: '2026-06-25', source: 'airbnb', synced_at: '2026-06-01T00:00:00Z' },
  { id: 'block-7', property_id: 'prop-3', start_date: '2026-07-01', end_date: '2026-07-07', source: 'booking_com', synced_at: '2026-06-01T00:00:00Z' },
  { id: 'block-8', property_id: 'prop-3', start_date: '2026-08-15', end_date: '2026-08-20', source: 'airbnb', synced_at: '2026-06-01T00:00:00Z' },
]

export const mockBookingRequests: MockBookingRequest[] = [
  {
    id: 'req-1',
    property_id: 'prop-1',
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '555-0123',
    check_in: '2026-07-01',
    check_out: '2026-07-05',
    guests_count: 2,
    message: 'We\'re visiting for a wedding nearby. Looking forward to it!',
    status: 'pending',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 'req-2',
    property_id: 'prop-2',
    guest_name: 'Jane Smith',
    guest_email: 'jane@example.com',
    guest_phone: null,
    check_in: '2026-09-15',
    check_out: '2026-09-20',
    guests_count: 2,
    message: '',
    status: 'approved',
    created_at: '2026-05-15T14:00:00Z',
    updated_at: '2026-05-16T09:00:00Z',
  },
]

// In-memory stores (mutable during dev session)
export let properties = [...mockProperties]
export let propertyImages = [...mockPropertyImages]
export let blockedDates = [...mockBlockedDates]
export let bookingRequests = [...mockBookingRequests]

// Reset to initial state (call between tests)
export function resetMockData(): void {
  properties = [...mockProperties]
  propertyImages = [...mockPropertyImages]
  blockedDates = [...mockBlockedDates]
  bookingRequests = [...mockBookingRequests]
}

// Property queries
export function getActiveProperties(): MockProperty[] {
  return properties.filter((p) => p.is_active).sort((a, b) => a.name.localeCompare(b.name))
}

export function getPropertyBySlug(slug: string): MockProperty | undefined {
  return properties.find((p) => p.slug === slug && p.is_active)
}

export function getPropertyById(id: string): MockProperty | undefined {
  return properties.find((p) => p.id === id)
}

export function updateProperty(id: string, updates: Partial<MockProperty>): MockProperty | null {
  const idx = properties.findIndex((p) => p.id === id)
  if (idx === -1) return null
  properties[idx] = { ...properties[idx], ...updates, updated_at: new Date().toISOString() }
  return properties[idx]
}

export function addProperty(property: Omit<MockProperty, 'id' | 'created_at' | 'updated_at'>): MockProperty {
  const newProperty: MockProperty = {
    ...property,
    id: `prop-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  properties.push(newProperty)
  return newProperty
}

// Image queries
export function getImagesByPropertyId(propertyId: string): MockPropertyImage[] {
  return propertyImages
    .filter((img) => img.property_id === propertyId)
    .sort((a, b) => a.display_order - b.display_order)
}

// Blocked date queries
export function getBlockedDatesByPropertyId(propertyId: string): MockBlockedDate[] {
  return blockedDates.filter((b) => b.property_id === propertyId)
}

export function hasBlockedDates(propertyId: string, startDate: string, endDate: string): boolean {
  return blockedDates.some(
    (b) => b.property_id === propertyId && b.start_date < endDate && b.end_date > startDate,
  )
}

export function addBlockedDate(propertyId: string, startDate: string, endDate: string, source: string): MockBlockedDate {
  const newBlock: MockBlockedDate = {
    id: `block-${Date.now()}`,
    property_id: propertyId,
    start_date: startDate,
    end_date: endDate,
    source,
    synced_at: new Date().toISOString(),
  }
  blockedDates.push(newBlock)
  return newBlock
}

// Booking request queries
export function getBookingRequests(filter?: { status?: string }): MockBookingRequest[] {
  let requests = [...bookingRequests]
  if (filter?.status) {
    requests = requests.filter((r) => r.status === filter.status)
  }
  return requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getBookingRequestById(id: string): MockBookingRequest | undefined {
  return bookingRequests.find((r) => r.id === id)
}

export function addBookingRequest(request: Omit<MockBookingRequest, 'id' | 'created_at' | 'updated_at'>): MockBookingRequest {
  const newRequest: MockBookingRequest = {
    ...request,
    id: `req-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  bookingRequests.push(newRequest)
  return newRequest
}

export function updateBookingRequestStatus(id: string, status: string): MockBookingRequest | null {
  const idx = bookingRequests.findIndex((r) => r.id === id)
  if (idx === -1) return null
  bookingRequests[idx] = { ...bookingRequests[idx], status, updated_at: new Date().toISOString() }
  return bookingRequests[idx]
}
