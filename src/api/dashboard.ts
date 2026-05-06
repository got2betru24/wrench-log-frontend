import client from './client'
import type { DashboardSummary } from '../types'

export const dashboardApi = {
  summary: () => client.get<DashboardSummary>('/dashboard').then((r) => r.data),
}
