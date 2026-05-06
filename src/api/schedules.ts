import client from './client'
import type { MaintenanceSchedule, ScheduleCreate, ScheduleUpdate } from '../types'

export const schedulesApi = {
  list: (vehicleId: number) =>
    client.get<MaintenanceSchedule[]>(`/vehicles/${vehicleId}/schedules`).then((r) => r.data),

  create: (vehicleId: number, payload: ScheduleCreate) =>
    client.post<MaintenanceSchedule>(`/vehicles/${vehicleId}/schedules`, payload).then((r) => r.data),

  seedTemplates: (vehicleId: number) =>
    client.post<MaintenanceSchedule[]>(`/vehicles/${vehicleId}/schedules/seed-templates`).then((r) => r.data),

  update: (vehicleId: number, scheduleId: number, payload: ScheduleUpdate) =>
    client.put<MaintenanceSchedule>(`/vehicles/${vehicleId}/schedules/${scheduleId}`, payload).then((r) => r.data),

  delete: (vehicleId: number, scheduleId: number) =>
    client.delete(`/vehicles/${vehicleId}/schedules/${scheduleId}`),
}
