import client from './client'
import type { MaintenanceEntry, EntryCreate, EntryUpdate, MileagePoint } from '../types'

export const entriesApi = {
  list: (vehicleId: number, limit = 50, offset = 0) =>
    client
      .get<MaintenanceEntry[]>(`/vehicles/${vehicleId}/entries`, { params: { limit, offset } })
      .then((r) => r.data),

  get: (entryId: number) =>
    client.get<MaintenanceEntry>(`/entries/${entryId}`).then((r) => r.data),

  create: (vehicleId: number, payload: EntryCreate) =>
    client.post<MaintenanceEntry>(`/vehicles/${vehicleId}/entries`, payload).then((r) => r.data),

  update: (entryId: number, payload: EntryUpdate) =>
    client.put<MaintenanceEntry>(`/entries/${entryId}`, payload).then((r) => r.data),

  delete: (entryId: number) =>
    client.delete(`/entries/${entryId}`),

  mileageHistory: (vehicleId: number) =>
    client.get<MileagePoint[]>(`/vehicles/${vehicleId}/mileage`).then((r) => r.data),

  uploadAttachment: (entryId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return client
      .post(`/entries/${entryId}/attachments`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  deleteAttachment: (attachmentId: number) =>
    client.delete(`/attachments/${attachmentId}`),

  attachmentUrl: (attachmentId: number) =>
    `/api/attachments/${attachmentId}/file`,
}
