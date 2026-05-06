import client from './client'
import type { Vehicle, VehicleCreate, VehicleUpdate, VehicleHealth } from '../types'

export const vehiclesApi = {
  list: (includeArchived = false) =>
    client.get<Vehicle[]>('/vehicles', { params: { include_archived: includeArchived } }).then((r) => r.data),

  get: (id: number) =>
    client.get<Vehicle>(`/vehicles/${id}`).then((r) => r.data),

  create: (payload: VehicleCreate) =>
    client.post<Vehicle>('/vehicles', payload).then((r) => r.data),

  update: (id: number, payload: VehicleUpdate) =>
    client.put<Vehicle>(`/vehicles/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    client.delete(`/vehicles/${id}`),

  health: (id: number) =>
    client.get<VehicleHealth>(`/vehicles/${id}/health`).then((r) => r.data),
}
