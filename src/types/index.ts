// ─────────────────────────────────────────
// Vehicles
// ─────────────────────────────────────────

export interface Vehicle {
  id: number
  name: string
  make: string
  model: string
  year: number
  vin: string | null
  color: string | null
  license_plate: string | null
  notes: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface VehicleCreate {
  name: string
  make: string
  model: string
  year: number
  vin?: string | null
  color?: string | null
  license_plate?: string | null
  notes?: string | null
}

export interface VehicleUpdate extends Partial<VehicleCreate> {
  archived?: boolean
}

// ─────────────────────────────────────────
// Schedules
// ─────────────────────────────────────────

export interface MaintenanceSchedule {
  id: number
  vehicle_id: number
  name: string
  description: string | null
  interval_miles: number | null
  interval_months: number | null
  estimated_cost: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface ScheduleCreate {
  name: string
  description?: string | null
  interval_miles?: number | null
  interval_months?: number | null
  estimated_cost?: string | null
  is_active?: boolean
  sort_order?: number
}

export interface ScheduleUpdate extends Partial<ScheduleCreate> {}

// ─────────────────────────────────────────
// Entries
// ─────────────────────────────────────────

export interface EntryAttachment {
  id: number
  entry_id: number
  filename: string
  stored_name: string
  mime_type: string
  file_size: number
  uploaded_at: string
}

export interface MaintenanceEntry {
  id: number
  vehicle_id: number
  schedule_id: number | null
  title: string
  notes: string | null
  odometer: number | null
  cost: string | null
  shop_name: string | null
  performed_at: string
  created_at: string
  updated_at: string
  attachments: EntryAttachment[]
}

export interface EntryCreate {
  schedule_id?: number | null
  title: string
  notes?: string | null
  odometer?: number | null
  cost?: string | null
  shop_name?: string | null
  performed_at: string
}

export interface EntryUpdate extends Partial<EntryCreate> {}

// ─────────────────────────────────────────
// Health / Dashboard
// ─────────────────────────────────────────

export type HealthStatus = 'overdue' | 'due_soon' | 'ok'
export type HealthColor = 'success' | 'warning' | 'error'

export interface UpcomingItem {
  schedule_id: number
  schedule_name: string
  vehicle_id: number
  vehicle_name: string
  status: HealthStatus
  last_odometer: number | null
  last_performed: string | null
  next_due_miles: number | null
  next_due_date: string | null
  miles_until_due: number | null
  days_until_due: number | null
}

export interface VehicleHealth {
  vehicle_id: number
  score: number
  label: string
  color: HealthColor
  overdue_count: number
  due_soon_count: number
  upcoming_items: UpcomingItem[]
  last_entry_date: string | null
  total_cost_ytd: string | null
  estimated_daily_miles: number | null
}

export interface MileagePoint {
  performed_at: string
  odometer: number
}

export interface DashboardSummary {
  total_vehicles: number
  overdue_count: number
  due_soon_count: number
  total_cost_ytd: string
  vehicles_health: VehicleHealth[]
}
