import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesApi } from '../api/vehicles'
import { schedulesApi } from '../api/schedules'
import { entriesApi } from '../api/entries'
import { dashboardApi } from '../api/dashboard'
import type { VehicleCreate, VehicleUpdate, ScheduleCreate, ScheduleUpdate, EntryCreate, EntryUpdate } from '../types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const qk = {
  dashboard: ['dashboard'] as const,
  vehicles: (archived?: boolean) => ['vehicles', archived] as const,
  vehicle: (id: number) => ['vehicle', id] as const,
  vehicleHealth: (id: number) => ['vehicle-health', id] as const,
  schedules: (vehicleId: number) => ['schedules', vehicleId] as const,
  entries: (vehicleId: number) => ['entries', vehicleId] as const,
  mileage: (vehicleId: number) => ['mileage', vehicleId] as const,
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: qk.dashboard,
    queryFn: dashboardApi.summary,
    refetchInterval: 60_000,
  })
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export function useVehicles(includeArchived = false) {
  return useQuery({
    queryKey: qk.vehicles(includeArchived),
    queryFn: () => vehiclesApi.list(includeArchived),
  })
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: qk.vehicle(id),
    queryFn: () => vehiclesApi.get(id),
    enabled: !!id,
  })
}

export function useVehicleHealth(id: number) {
  return useQuery({
    queryKey: qk.vehicleHealth(id),
    queryFn: () => vehiclesApi.health(id),
    enabled: !!id,
  })
}

export function useCreateVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehicleCreate) => vehiclesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  })
}

export function useUpdateVehicle(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehicleUpdate) => vehiclesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.vehicle(id) })
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useDeleteVehicle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export function useSchedules(vehicleId: number) {
  return useQuery({
    queryKey: qk.schedules(vehicleId),
    queryFn: () => schedulesApi.list(vehicleId),
    enabled: !!vehicleId,
  })
}

export function useCreateSchedule(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ScheduleCreate) => schedulesApi.create(vehicleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.schedules(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useSeedTemplates(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => schedulesApi.seedTemplates(vehicleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.schedules(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useUpdateSchedule(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ScheduleUpdate }) =>
      schedulesApi.update(vehicleId, id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.schedules(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
    },
  })
}

export function useDeleteSchedule(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (scheduleId: number) => schedulesApi.delete(vehicleId, scheduleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.schedules(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

// ─── Entries ──────────────────────────────────────────────────────────────────

export function useEntries(vehicleId: number) {
  return useQuery({
    queryKey: qk.entries(vehicleId),
    queryFn: () => entriesApi.list(vehicleId),
    enabled: !!vehicleId,
  })
}

export function useMileageHistory(vehicleId: number) {
  return useQuery({
    queryKey: qk.mileage(vehicleId),
    queryFn: () => entriesApi.mileageHistory(vehicleId),
    enabled: !!vehicleId,
  })
}

export function useCreateEntry(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: EntryCreate) => entriesApi.create(vehicleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.mileage(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useUpdateEntry(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EntryUpdate }) =>
      entriesApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.mileage(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useDeleteEntry(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entryId: number) => entriesApi.delete(entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.mileage(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}

export function useImportEntriesCsv(vehicleId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ file, skipErrors = false }: { file: File; skipErrors?: boolean }) =>
      entriesApi.importCsv(vehicleId, file, skipErrors),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entries(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.mileage(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.vehicleHealth(vehicleId) })
      qc.invalidateQueries({ queryKey: qk.dashboard })
    },
  })
}