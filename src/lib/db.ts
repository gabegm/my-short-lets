import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

// ─── Mock data mode (overrides everything) ────────────────────────

if (USE_MOCK_DATA) {
  const mockData = require('./mock-data.ts')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockClient: any = { from: () => {} }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockServerClient: any = { from: () => {} }

  mockClient.from = function (table: string) {
    return mockFrom(table)
  }
  mockServerClient.from = function (table: string) {
    return mockFrom(table)
  }

  function mockFrom(table: string) {
    // Use the mock data module's exported functions
    const getProperties = mockData.getActiveProperties
    const getPropertyById = mockData.getPropertyById
    const getPropertyBySlug = mockData.getPropertyBySlug
    const getImagesByPropertyId = mockData.getImagesByPropertyId
    const getBlockedDatesByPropertyId = mockData.getBlockedDatesByPropertyId
    const getBookingRequests = mockData.getBookingRequests
    const getBookingRequestById = mockData.getBookingRequestById
    const addBookingRequest = mockData.addBookingRequest
    const updateBookingRequestStatus = mockData.updateBookingRequestStatus
    const addBlockedDate = mockData.addBlockedDate
    const updateProperty = mockData.updateProperty
    const addProperty = mockData.addProperty
    const hasBlockedDates = mockData.hasBlockedDates
    const getActiveProperties = mockData.getActiveProperties

    let selectFields = '*'
    const filters: { column: string; value: unknown }[] = []
    let orderByCol = ''
    let orderByAsc = true
    let limitCount: number | null = null
    let singleMode = false
    let countMode = false
    let headMode = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.select = function (fields: string = '*', options?: { count?: 'exact'; head?: boolean }) {
      selectFields = fields
      if (options?.count === 'exact' || options?.head) {
        countMode = true
        headMode = !!options?.head
      }
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.eq = function (column: string, value: unknown) {
      filters.push({ column, value })
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.filter = function (column: string, _operator: string, value: unknown) {
      filters.push({ column, value })
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.order = function (column: string, options?: { ascending?: boolean }) {
      orderByCol = column
      orderByAsc = options?.ascending !== false
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.limit = function (n: number) {
      limitCount = n
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.maybeSingle = function () {
      singleMode = true
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.single = function () {
      singleMode = true
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.count = function (_mode: 'exact' | 'planned' | 'estimated') {
      countMode = true
      return chain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.insert = function (data: Record<string, unknown> | Record<string, unknown>[]) {
      const rows = Array.isArray(data) ? data : [data]
      const now = new Date().toISOString()

      const inserted: Record<string, unknown>[] = []
      rows.forEach((row) => {
        const newRow: Record<string, unknown> = { ...row }
        if (!newRow.id) {
          const prefix = table === 'properties' ? 'prop' : table === 'property_images' ? 'img' : table === 'blocked_dates' ? 'block' : 'req'
          newRow.id = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        }
        if (!newRow.created_at) newRow.created_at = now
        if (!newRow.updated_at) newRow.updated_at = now
        inserted.push(newRow)
      })

      // Route insert to the correct mock data function
      if (table === 'booking_requests') {
        addBookingRequest(inserted[0] as any)
      } else if (table === 'blocked_dates') {
        addBlockedDate(inserted[0] as any)
      } else if (table === 'properties') {
        addProperty(inserted[0] as any)
      }

      const insertChain = chain as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insertChain.select = function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        insertChain.single = function () {
          return { data: inserted[inserted.length - 1], error: null }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        insertChain.then = function (onfulfilled: any) {
          return onfulfilled({ data: inserted, error: null })
        }
        return insertChain
      }

      return insertChain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.update = function (data: Record<string, unknown>) {
      // Store the update data; apply it in .then() when filters are set
      const updateData = { ...data }
      const updateChain = chain as any

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateChain.select = function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateChain.single = function () {
          // Return a thenable that applies the update
          const singleChain = {} as Record<string, unknown> & { then: (onfulfilled: any) => any }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          singleChain.then = function (onfulfilled: any) {
            const updated: Record<string, unknown>[] = []

            if (table === 'booking_requests') {
              const idFilter = filters.find(f => f.column === 'id')
              if (idFilter) {
                const result = updateBookingRequestStatus(idFilter.value as string, updateData as any)
                if (result) updated.push(result)
              }
            } else if (table === 'properties') {
              const idFilter = filters.find(f => f.column === 'id')
              if (idFilter) {
                const result = updateProperty(idFilter.value as string, updateData as any)
                if (result) updated.push(result)
              }
            }

            if (updated.length === 0) {
              return onfulfilled({ data: null, error: { message: 'No rows updated' } })
            }
            return onfulfilled({ data: updated, error: null })
          }
          return singleChain
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        updateChain.then = function (onfulfilled: any) {
          const updated: Record<string, unknown>[] = []

          if (table === 'booking_requests') {
            const idFilter = filters.find(f => f.column === 'id')
            if (idFilter) {
              const result = updateBookingRequestStatus(idFilter.value as string, updateData as any)
              if (result) updated.push(result)
            }
          } else if (table === 'properties') {
            const idFilter = filters.find(f => f.column === 'id')
            if (idFilter) {
              const result = updateProperty(idFilter.value as string, updateData as any)
              if (result) updated.push(result)
            }
          }

          return onfulfilled({ data: updated, error: null })
        }
        return updateChain
      }

      return updateChain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.delete = function () {
      const deleteChain = chain as Record<string, unknown> & { select: () => Record<string, unknown> }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deleteChain.select = function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deleteChain.then = function (onfulfilled: any) {
          return onfulfilled({ data: null, error: null })
        }
        return deleteChain
      }
      return deleteChain
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chain.then = function (onfulfilled: any) {
      let result: Record<string, unknown>[] = []

      // Route to the correct mock data function based on table
      if (table === 'properties') {
        if (countMode) {
          // Count query — return the count
          const allProps = getActiveProperties()
          let filtered = allProps
          // Apply filters to count
          for (const filter of filters) {
            filtered = filtered.filter((p: any) => {
              const val = (p as Record<string, unknown>)[filter.column]
              return val === filter.value
            })
          }
          if (headMode) {
            return onfulfilled({ count: filtered.length, error: null, data: null })
          }
          return onfulfilled({ data: null, error: null, count: filtered.length })
        }

        if (filters.some(f => f.column === 'slug')) {
          const prop = getPropertyBySlug(filters.find(f => f.column === 'slug')?.value as string)
          // Also check is_active filter
          const hasActiveFilter = filters.some(f => f.column === 'is_active' && f.value === true)
          if (prop && (!hasActiveFilter || prop.is_active)) {
            result = [prop]
          }
        } else if (filters.some(f => f.column === 'id')) {
          const prop = getPropertyById(filters.find(f => f.column === 'id')?.value as string)
          result = prop ? [prop] : []
        } else {
          result = getActiveProperties()
        }
      } else if (table === 'property_images') {
        if (countMode) {
          const allImages = getImagesByPropertyId(filters.find(f => f.column === 'property_id')?.value as string)
          return onfulfilled({ data: null, error: null, count: allImages.length })
        }
        if (filters.some(f => f.column === 'property_id')) {
          result = getImagesByPropertyId(filters.find(f => f.column === 'property_id')?.value as string)
        }
      } else if (table === 'blocked_dates') {
        if (countMode) {
          const allDates = getBlockedDatesByPropertyId(filters.find(f => f.column === 'property_id')?.value as string)
          return onfulfilled({ data: null, error: null, count: allDates.length })
        }
        if (filters.some(f => f.column === 'property_id')) {
          result = getBlockedDatesByPropertyId(filters.find(f => f.column === 'property_id')?.value as string)
        }
      } else if (table === 'booking_requests') {
        if (countMode) {
          const allReqs = getBookingRequests()
          let filtered = allReqs
          for (const filter of filters) {
            filtered = filtered.filter((r: any) => {
              const val = (r as Record<string, unknown>)[filter.column]
              return val === filter.value
            })
          }
          if (headMode) {
            return onfulfilled({ count: filtered.length, error: null, data: null })
          }
          return onfulfilled({ data: null, error: null, count: filtered.length })
        }
        if (filters.some(f => f.column === 'id')) {
          const req = getBookingRequestById(filters.find(f => f.column === 'id')?.value as string)
          result = req ? [req] : []
        } else {
          result = getBookingRequests()
        }
      }

      // Handle joins (properties with property_images)
      if (selectFields.includes('property_images') && table === 'properties') {
        result = result.map((row) => {
          const propertyRow = row as Record<string, unknown>
          const propertyId = propertyRow.id as string
          const images = getImagesByPropertyId(propertyId)
          return { ...propertyRow, property_images: images }
        })
      }

      // Handle single mode
      if (singleMode) {
        if (result.length === 0) {
          return onfulfilled({ data: null, error: { message: 'No rows found' } })
        }
        if (result.length > 1) {
          return onfulfilled({ data: result[0], error: { message: 'Ambiguous result, use .select() without .single()' } })
        }
        return onfulfilled({ data: result[0], error: null })
      }

      // Handle limit
      if (limitCount !== null) {
        result = result.slice(0, limitCount)
      }

      // Handle ordering
      if (orderByCol) {
        result.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[orderByCol]
          const bVal = (b as Record<string, unknown>)[orderByCol]
          const cmp = String(aVal).localeCompare(String(bVal))
          return orderByAsc ? cmp : -cmp
        })
      }

      return onfulfilled({ data: result, error: null })
    }

    return chain
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).__mockSupabase = mockClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).__mockSupabaseServer = mockServerClient
}

// ─── Real Supabase client (only when NOT in mock mode) ────────────

let realSupabase: ReturnType<typeof createClient> | undefined
let realSupabaseServer: ReturnType<typeof createClient> | undefined

if (!USE_MOCK_DATA) {
  realSupabase = createClient(supabaseUrl!, supabaseKey!)
  realSupabaseServer = createClient(
    supabaseUrl!,
    serviceRoleKey || supabaseKey!,
  )
}

// ─── Public exports ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = USE_MOCK_DATA ? (globalThis as any).__mockSupabase : realSupabase!
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseServer: any = USE_MOCK_DATA ? (globalThis as any).__mockSupabaseServer : realSupabaseServer!
