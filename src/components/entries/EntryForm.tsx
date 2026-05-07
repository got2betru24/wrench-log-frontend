import { useState, useEffect } from 'react'
import {
  Box, TextField, Button, Grid, Typography, CircularProgress,
  Alert, InputAdornment, Chip, Stack, Divider,
  FormGroup, FormControlLabel, Checkbox, Paper,
} from '@mui/material'
import {
  Save as SaveIcon, Warning as WarningIcon, Error as ErrorIcon,
  AutoAwesome as SmartIcon, CheckBox as CheckBoxIcon,
} from '@mui/icons-material'
import type { MaintenanceSchedule, MaintenanceEntry, VehicleHealth, EntryCreate } from '../../types'

interface Props {
  vehicleId: number
  schedules: MaintenanceSchedule[]
  health: VehicleHealth | undefined
  lastEntry: MaintenanceEntry | undefined
  onSubmit: (data: EntryCreate) => Promise<void>
  onCancel: () => void
  initial?: MaintenanceEntry
  loading?: boolean
  error?: string | null
}

function scheduleStatus(scheduleId: number, health: VehicleHealth | undefined) {
  if (!health) return null
  return health.upcoming_items.find((i) => i.schedule_id === scheduleId)?.status ?? null
}

export default function EntryForm({
  vehicleId, schedules, health, lastEntry,
  onSubmit, onCancel, initial, loading = false, error,
}: Props) {
  const today = new Date().toISOString().split('T')[0]

  const overdueIds = health?.upcoming_items
    .filter((i) => i.status === 'overdue' || i.status === 'due_soon')
    .map((i) => i.schedule_id) ?? []

  // Initialize directly from `initial` so the title is never empty on first render
  // (avoids the Save button being briefly/permanently disabled on edit)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(initial?.schedule_ids ?? [])
  )
  const [form, setForm] = useState(() => initial
    ? {
        title: initial.title,
        notes: initial.notes ?? '',
        odometer: initial.odometer ? String(initial.odometer) : '',
        cost: initial.cost ? String(initial.cost) : '',
        shop_name: initial.shop_name ?? '',
        performed_at: initial.performed_at,
      }
    : {
        title: '',
        notes: '',
        odometer: lastEntry?.odometer ? String(lastEntry.odometer) : '',
        cost: '',
        shop_name: "Weaver's Garage",
        performed_at: today,
      }
  )
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(!!initial)

  // Re-sync if the dialog is reused for a different entry (e.g. editing entry A then entry B)
  useEffect(() => {
    if (initial) {
      setSelectedIds(new Set(initial.schedule_ids))
      setForm({
        title: initial.title,
        notes: initial.notes ?? '',
        odometer: initial.odometer ? String(initial.odometer) : '',
        cost: initial.cost ? String(initial.cost) : '',
        shop_name: initial.shop_name ?? '',
        performed_at: initial.performed_at,
      })
      setTitleManuallyEdited(true)
    } else {
      setSelectedIds(new Set(overdueIds))
      setForm({
        title: '',
        notes: '',
        odometer: lastEntry?.odometer ? String(lastEntry.odometer) : '',
        cost: '',
        shop_name: "Weaver's Garage",
        performed_at: today,
      })
      setTitleManuallyEdited(false)
    }
  }, [initial?.id])

  // Auto-generate title from checked schedules unless user has typed their own
  useEffect(() => {
    if (titleManuallyEdited) return
    const names = activeSchedules
      .filter((s) => selectedIds.has(s.id))
      .map((s) => s.name)
    setForm((p) => ({ ...p, title: names.join(', ') }))
  }, [selectedIds, titleManuallyEdited])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const toggleSchedule = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    // Clear auto-title if user is interacting with checkboxes after manual edit
    if (titleManuallyEdited) return
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      schedule_ids: Array.from(selectedIds),
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      odometer: form.odometer ? parseInt(form.odometer) : null,
      cost: form.cost || null,
      shop_name: form.shop_name.trim() || null,
      performed_at: form.performed_at,
    })
  }

  // Sort: overdue first, due_soon, ok, then inactive
  const statusOrder = { overdue: 0, due_soon: 1, ok: 2 }
  const activeSchedules = [...schedules].sort((a, b) => {
    if (!a.is_active && b.is_active) return 1
    if (a.is_active && !b.is_active) return -1
    const aStatus = scheduleStatus(a.id, health) ?? 'ok'
    const bStatus = scheduleStatus(b.id, health) ?? 'ok'
    return (statusOrder[aStatus as keyof typeof statusOrder] ?? 2) -
           (statusOrder[bStatus as keyof typeof statusOrder] ?? 2)
  })

  const hasOverdueAlert = !initial && overdueIds.length > 0

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hasOverdueAlert && (
        <Alert severity="warning" icon={<SmartIcon />} sx={{ mb: 2 }}>
          {overdueIds.length === 1
            ? <><strong>{health!.upcoming_items.find(i => i.schedule_id === overdueIds[0])?.schedule_name}</strong> is overdue or coming up — pre-checked below.</>
            : <><strong>{overdueIds.length} items</strong> are overdue or coming up — pre-checked below.</>
          }
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* LEFT COLUMN: main fields */}
        <Grid item xs={12} md={7}>
          <Stack spacing={2}>
            {/* Title */}
            <TextField
              label="Title"
              placeholder='e.g. "Oil Change & Tire Rotation"'
              value={form.title}
              onChange={(e) => { set('title')(e); setTitleManuallyEdited(true) }}
              required
              fullWidth
              size="small"
              helperText={!titleManuallyEdited && selectedIds.size > 0 ? 'Auto-filled from checked items — you can edit this' : undefined}
            />

            {/* Date + Odometer */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Date Performed"
                type="date"
                value={form.performed_at}
                onChange={set('performed_at')}
                required
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Odometer"
                type="number"
                value={form.odometer}
                onChange={set('odometer')}
                fullWidth
                size="small"
                inputProps={{ min: 0 }}
                InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }}
                helperText={lastEntry?.odometer && !form.odometer ? `Last: ${lastEntry.odometer.toLocaleString()} mi` : undefined}
              />
            </Stack>

            {/* Cost + Shop */}
            <Stack direction="row" spacing={2}>
              <TextField
                label="Cost"
                type="number"
                value={form.cost}
                onChange={set('cost')}
                fullWidth
                size="small"
                inputProps={{ min: 0, step: '0.01' }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <TextField
                label="Shop / Location"
                placeholder="Weaver's Garage, Dealer…"
                value={form.shop_name}
                onChange={set('shop_name')}
                fullWidth
                size="small"
              />
            </Stack>

            {/* Notes */}
            <TextField
              label="Notes"
              placeholder="Part numbers, observations, anything worth remembering…"
              value={form.notes}
              onChange={set('notes')}
              fullWidth
              multiline
              minRows={4}
              size="small"
            />
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: schedule checkboxes */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <CheckBoxIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                Items Completed
              </Typography>
              {selectedIds.size > 0 && (
                <Chip
                  label={selectedIds.size}
                  size="small"
                  color="primary"
                  sx={{ height: 16, fontSize: '0.65rem', ml: 'auto' }}
                />
              )}
            </Stack>
            <Divider sx={{ mb: 1 }} />

            {activeSchedules.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No schedule items defined for this vehicle yet.
              </Typography>
            ) : (
              <FormGroup sx={{ gap: 0.25, overflowY: 'auto', flexGrow: 1 }}>
                {activeSchedules.map((s) => {
                  const status = scheduleStatus(s.id, health)
                  return (
                    <FormControlLabel
                      key={s.id}
                      disabled={!s.is_active}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSchedule(s.id)}
                          sx={{ py: 0.5 }}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
                          <Typography variant="body2" sx={{ opacity: s.is_active ? 1 : 0.45 }}>
                            {s.name}
                          </Typography>
                          {status === 'overdue' && (
                            <Chip
                              icon={<ErrorIcon sx={{ fontSize: '10px !important' }} />}
                              label="Overdue"
                              color="error"
                              size="small"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                          )}
                          {status === 'due_soon' && (
                            <Chip
                              icon={<WarningIcon sx={{ fontSize: '10px !important' }} />}
                              label="Due Soon"
                              color="warning"
                              size="small"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                          )}
                          {!s.is_active && (
                            <Chip label="Inactive" size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
                          )}
                        </Stack>
                      }
                      sx={{ mx: 0, alignItems: 'flex-start' }}
                    />
                  )
                })}
              </FormGroup>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" gap={1}>
            <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !form.title || !form.performed_at}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {initial ? 'Save Changes' : 'Log Maintenance'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}