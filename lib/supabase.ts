import { createBrowserClient } from '@supabase/ssr'

// Client-side Supabase - dùng trong components
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Project = {
  id: string
  code: string
  customer_name: string
  customer_phone: string
  address: string
  service_type: string
  start_date: string
  received_date: string
  result_date: string
  status: string
  total_price: number
  engineer_share: number
  company_share: number
  engineer_id: string
  payment_status: string
  notes: string
  drawing_url: string | null
  created_at: string
}

export type Engineer = {
  id: string
  name: string
  phone: string
  user_id: string
  created_at: string
}

export type LandParcel = {
  id: string
  project_id: string
  parcel_number: string
  map_sheet_number: string
  area: number
  land_type: string
  address_commune_ward: string
  address_district_city: string
}
