import { useState } from 'react'
import {
  Box, Typography, Grid, Stack, Button, IconButton, Tooltip,
  Tabs, Tab, Paper, Chip, Divider, CircularProgress, Alert,
  Breadcrumbs, Link, Menu, MenuItem, ListItemIcon, Snackbar,
} from '@mui/material'
import {
  ArrowBack as BackIcon, Edit as EditIcon,
  Add as AddIcon, Build as BuildIcon,
  Timeline as TimelineIcon, CalendarMonth as ScheduleIcon,
  Speed as SpeedIcon, MoreVert as MoreIcon,
  Archive as ArchiveIcon, Delete as DeleteIcon,
  Error as ErrorIcon, Warning as WarningIcon,
  FileUpload as FileUploadIcon,
} from '@mui/icons-material'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import {
  useVehicle, useVehicleHealth, useSchedules, useEntries,
  useMileageHistory, useCreateEntry, useUpdateEntry, useDeleteEntry,
  useUpdateVehicle, useDeleteVehicle,
} from '../hooks'
import EntryTimeline from '../components/entries/EntryTimeline'
import EntryForm from '../components/entries/EntryForm'
import ImportEntriesDialog from '../components/entries/ImportEntriesDialog'
import ScheduleManager from '../components/schedule/ScheduleManager'
import MileageChart from '../components/entries/MileageChart'
import ScoreGauge from '../components/shared/ScoreGauge'
import HealthChip from '../components/shared/HealthChip'
import ConfirmDialog from '../components/shared/ConfirmDialog'
import type { MaintenanceEntry } from '../types'

type TabValue = 'timeline' | 'schedule' | 'stats'

export default function VehicleDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const vehicleId = parseInt(id!)

  const { data: vehicle, isLoading: vehicleLoading } = useVehicle(vehicleId)
  const { data: health } = useVehicleHealth(vehicleId)
  const { data: schedules = [] } = useSchedules(vehicleId)
  const { data: entries = [], isLoading: entriesLoading } = useEntries(vehicleId)
  const { data: mileage = [] } = useMileageHistory(vehicleId)

  const createEntry = useCreateEntry(vehicleId)
  const updateEntry = useUpdateEntry(vehicleId)
  const deleteEntry = useDeleteEntry(vehicleId)
  const updateVehicle = useUpdateVehicle(vehicleId)
  const deleteVehicle = useDeleteVehicle()

  const [tab, setTab] = useState<TabValue>('timeline')
  const [logOpen, setLogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<MaintenanceEntry | null>(null)
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null)
  const [deleteVehicleOpen, setDeleteVehicleOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importSnack, setImportSnack] = useState<string | null>(null)

  if (vehicleLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>
  }
  if (!vehicle) {
    return <Box sx={{ p: 3 }}><Alert severity="error">Vehicle not found.</Alert></Box>
  }

  const lastEntry = entries[0]
  const overdue = health?.upcoming_items.filter((i) => i.status === 'overdue') ?? []
  const dueSoon = health?.upcoming_items.filter((i) => i.status === 'due_soon') ?? []

  const handleLogSubmit = async (data: any) => {
    setFormError(null)
    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, payload: data })
      } else {
        await createEntry.mutateAsync(data)
      }
      setLogOpen(false)
      setEditingEntry(null)
    } catch (e: any) {
      setFormError(e.message)
      throw e
    }
  }

  const handleEditEntry = (entry: MaintenanceEntry) => {
    setEditingEntry(entry)
    setLogOpen(true)
    setFormError(null)
  }

  const handleDeleteEntry = async (entryId: number) => {
    setDeletingEntryId(entryId)
    try {
      await deleteEntry.mutateAsync(entryId)
    } finally {
      setDeletingEntryId(null)
    }
  }

  const handleArchive = async () => {
    await updateVehicle.mutateAsync({ archived: !vehicle.archived })
    setMenuAnchor(null)
  }

  const handleDeleteVehicle = async () => {
    await deleteVehicle.mutateAsync(vehicleId)
    navigate('/vehicles')
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="text.secondary" variant="body2">Dashboard</Link>
        <Link component={RouterLink} to="/vehicles" underline="hover" color="text.secondary" variant="body2">Vehicles</Link>
        <Typography variant="body2" color="text.primary">{vehicle.name}</Typography>
      </Breadcrumbs>

      {/* Vehicle header */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2} flexWrap="wrap">
          <Stack direction="row" alignItems="flex-start" gap={2}>
            <Tooltip title="Back"><IconButton onClick={() => navigate('/vehicles')} size="small"><BackIcon /></IconButton></Tooltip>
            <Box>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="h4" fontWeight={700}>{vehicle.name}</Typography>
                {vehicle.archived && <Chip label="Archived" size="small" />}
                {health && <HealthChip label={health.label} color={health.color} />}
              </Stack>
              <Typography variant="body1" color="text.secondary" mt={0.25}>
                {vehicle.year} {vehicle.make} {vehicle.model}
                {vehicle.color ? ` · ${vehicle.color}` : ''}
                {vehicle.license_plate ? ` · ${vehicle.license_plate}` : ''}
              </Typography>
              {vehicle.vin && (
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"DM Mono", monospace' }}>
                  VIN: {vehicle.vin}
                </Typography>
              )}

              {/* Quick stats */}
              <Stack direction="row" gap={2.5} mt={1.5} flexWrap="wrap">
                {lastEntry?.odometer && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {lastEntry.odometer.toLocaleString()} mi (last reading)
                    </Typography>
                  </Stack>
                )}
                {health?.total_cost_ytd && (
                  <Typography variant="caption" color="text.secondary">
                    ${parseFloat(health.total_cost_ytd).toFixed(0)} spent in {new Date().getFullYear()}
                  </Typography>
                )}
                {health?.estimated_daily_miles && (
                  <Typography variant="caption" color="text.secondary">
                    ~{Math.round(health.estimated_daily_miles)} mi/day avg
                  </Typography>
                )}
              </Stack>

              {/* Alert badges */}
              {(overdue.length > 0 || dueSoon.length > 0) && (
                <Stack direction="row" gap={1} mt={1.5} flexWrap="wrap">
                  {overdue.length > 0 && (
                    <Chip icon={<ErrorIcon />} label={`${overdue.length} overdue`} color="error" size="small" />
                  )}
                  {dueSoon.length > 0 && (
                    <Chip icon={<WarningIcon />} label={`${dueSoon.length} due soon`} color="warning" size="small" />
                  )}
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" gap={1}>
            {health && <ScoreGauge score={health.score} size={80} />}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setEditingEntry(null); setFormError(null); setLogOpen(true) }}
            >
              Log Maintenance
            </Button>
            <Tooltip title="More options">
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreIcon />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem onClick={() => { navigate(`/vehicles/${vehicleId}/edit`); setMenuAnchor(null) }}>
                <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit Vehicle
              </MenuItem>
              <MenuItem onClick={handleArchive}>
                <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
                {vehicle.archived ? 'Unarchive' : 'Archive'}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setDeleteVehicleOpen(true); setMenuAnchor(null) }} sx={{ color: 'error.main' }}>
                <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete Vehicle
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      {/* Log Maintenance form */}
      {logOpen && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderColor: 'primary.main' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            {editingEntry ? 'Edit Entry' : 'Log Maintenance'}
          </Typography>
          <EntryForm
            vehicleId={vehicleId}
            schedules={schedules}
            health={health}
            lastEntry={lastEntry}
            onSubmit={handleLogSubmit}
            onCancel={() => { setLogOpen(false); setEditingEntry(null) }}
            initial={editingEntry ?? undefined}
            loading={createEntry.isPending || updateEntry.isPending}
            error={formError}
          />
        </Paper>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab value="timeline" label="History" icon={<TimelineIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab value="schedule" label="Schedule" icon={<ScheduleIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        <Tab value="stats" label="Stats & Mileage" icon={<SpeedIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
      </Tabs>

      {/* Timeline tab */}
      {tab === 'timeline' && (
        entriesLoading
          ? <CircularProgress size={24} />
          : (
            <>
              {entries.length !== 0 && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">History</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileUploadIcon />}
                    onClick={() => setImportOpen(true)}
                  >
                    Import CSV
                  </Button>
                </Stack>
              )}
              <EntryTimeline
                entries={entries}
                schedules={schedules}
                vehicleId={vehicleId}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
                deleting={deletingEntryId}
              />
            </>
          )
      )}

      {/* Schedule tab */}
      {tab === 'schedule' && <ScheduleManager vehicleId={vehicleId} />}

      {/* Stats tab */}
      {tab === 'stats' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <MileageChart data={mileage} />
            </Paper>
          </Grid>

          {health && health.upcoming_items.length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="overline" color="text.secondary" display="block" mb={2}>
                  Upcoming Maintenance
                </Typography>
                <Stack gap={1.5}>
                  {health.upcoming_items.map((item) => (
                    <Stack key={item.schedule_id} direction="row" alignItems="center" gap={2} flexWrap="wrap">
                      <Box sx={{ minWidth: 180 }}>
                        <Typography variant="body2" fontWeight={600}>{item.schedule_name}</Typography>
                        {item.last_performed && (
                          <Typography variant="caption" color="text.secondary">
                            Last: {new Date(item.last_performed + 'T00:00:00').toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                        {item.next_due_miles !== null && (
                          <Chip
                            label={`Due @ ${item.next_due_miles.toLocaleString()} mi`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.68rem' }}
                          />
                        )}
                        {item.next_due_date && (
                          <Chip
                            label={`~${new Date(item.next_due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.68rem' }}
                          />
                        )}
                        <Chip
                          label={
                            item.status === 'overdue' ? 'Overdue' :
                            item.status === 'due_soon' ? 'Due Soon' : 'OK'
                          }
                          color={
                            item.status === 'overdue' ? 'error' :
                            item.status === 'due_soon' ? 'warning' : 'success'
                          }
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem' }}
                        />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Import dialog */}
      <ImportEntriesDialog
        open={importOpen}
        vehicleId={vehicleId}
        onClose={() => setImportOpen(false)}
        onSuccess={(imported, skipped) => {
          setImportOpen(false)
          setImportSnack(
            skipped > 0
              ? `${imported} entries imported, ${skipped} skipped due to errors.`
              : `${imported} entries imported successfully.`
          )
        }}
      />
      <Snackbar
        open={!!importSnack}
        autoHideDuration={5000}
        onClose={() => setImportSnack(null)}
      >
        <Alert severity="success" onClose={() => setImportSnack(null)}>
          {importSnack}
        </Alert>
      </Snackbar>

      {/* Delete vehicle confirm */}
      <ConfirmDialog
        open={deleteVehicleOpen}
        title="Delete Vehicle"
        message={`Permanently delete "${vehicle.name}" and all its maintenance history? This cannot be undone.`}
        confirmLabel="Delete Vehicle"
        loading={deleteVehicle.isPending}
        onConfirm={handleDeleteVehicle}
        onCancel={() => setDeleteVehicleOpen(false)}
      />
    </Box>
  )
}