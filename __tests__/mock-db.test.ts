import { describe, it, expect, beforeEach } from 'vitest'
import { resetMockData } from '@/lib/mock-data'

async function withMockData(fn: () => Promise<void> | void) {
  const prev = process.env.USE_MOCK_DATA
  process.env.USE_MOCK_DATA = 'true'
  resetMockData()
  try {
    await fn()
  } finally {
    process.env.USE_MOCK_DATA = prev
  }
}

describe('mock db layer', () => {
  beforeEach(() => {
    resetMockData()
  })

  it('lists all active properties', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*')
        .eq('is_active', true)

      expect(error).toBeNull()
      expect(data).toHaveLength(3)
      const slugs = data.map((p: any) => p.slug)
      expect(slugs).toContain('cozy-downtown-loft')
      expect(slugs).toContain('beachside-cottage')
      expect(slugs).toContain('mountain-cabin')
    })
  })

  it('gets a single property by slug', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*')
        .eq('slug', 'beachside-cottage')
        .eq('is_active', true)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.slug).toBe('beachside-cottage')
      expect(data.price_per_night).toBe(200)
    })
  })

  it('gets property with images via join', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*, property_images (url, display_order, is_primary)')
        .eq('slug', 'cozy-downtown-loft')
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.property_images).toHaveLength(3)
      expect(data.property_images[0].url).toContain('placehold')
    })
  })

  it('counts properties correctly (admin dashboard)', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error, count } = await supabaseServer
        .from('properties')
        .select('id', { count: 'exact', head: true })

      expect(error).toBeNull()
      expect(count).toBe(3)
    })
  })

  it('lists properties ordered by name', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('name')

      expect(error).toBeNull()
      expect(data[0].name).toBe('Beachside Cottage')
      expect(data[1].name).toBe('Cozy Downtown Loft')
      expect(data[2].name).toBe('Mountain Cabin')
    })
  })

  it('handles multiple .eq() filters on property detail page', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*, property_images (url, display_order, is_primary)')
        .eq('slug', 'mountain-cabin')
        .eq('is_active', true)
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.slug).toBe('mountain-cabin')
      expect(data.property_images).toHaveLength(3)
    })
  })

  it('returns null for non-existent property', async () => {
    await withMockData(async () => {
      const { supabaseServer } = await import('@/lib/db')
      const { data, error } = await supabaseServer
        .from('properties')
        .select('*')
        .eq('slug', 'nonexistent')
        .eq('is_active', true)
        .single()

      expect(data).toBeNull()
    })
  })
})
