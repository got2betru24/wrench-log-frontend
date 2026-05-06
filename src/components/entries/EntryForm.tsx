import { useState, useEffect } from 'react'
import {
  Box, TextField, Button, Grid, Typography, CircularProgress,
  Alert, InputAdornment, MenuItem, Chip, Stack, Divider,
  FormControl, InputLabel, Select, Autocomplete,
} from '@mui/material'
import {
  Save as SaveIcon, Warning as WarningIcon, Error as ErrorIcon,
  AutoAwesome as SmartIcon,
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

function scheduleStatusColor(scheduleId: number, health: VehicleHealth | undefined) {
  if (!health) return null
  const item = health.upcoming_items.find((i) => i.schedule_id === scheduleId)
  return item?.status ?? null
}

export default function EntryForm({
  vehicleId, schedules, health, lastEntry,
  onSubmit, onCancel, initial, loading = false, error,
}: Props) {
  const today = new Date().toISOString().split('T')[0]

  // Determine smart default: first overdue/due_soon item
  const smartDefault = health?.upcoming_items.find((i) => i.status !== 'ok')

  const [form, setForm] = useState({
    schedule_id: '',
    title: '',
    notes: '',
    odometer: '',
    cost: '',
    shop_name: '',
    performed_at: today,
  })
  const [isCustomTitle, setIsCustomTitle] = useState(false)

  useEffect(() => {
    if (initial) {
      setForm({
        schedule_id: initial.schedule_id ? String(initial.schedule_id) : '',
        title: initial.title,
        notes: initial.notes ?? '',
        odometer: initial.odometer ? String(initial.odometer) : '',
        cost: initial.cost ? String(initial.cost) : '',
        shop_name: initial.shop_name ?? '',
        performed_at: initial.performed_at,
      })
      setIsCustomTitle(!initial.schedule_id)
    } else {
      // Smart defaults
      if (smartDefault) {
        const sched = schedules.find((s) => s.id === smartDefault.schedule_id)
        if (sched) {
          setForm((p) => ({ ...p, schedule_id: String(sched.id), title: sched.name }))
        }
      }
      // Default odometer to last entry's odometer
      if (lastEntry?.odometer) {
        setForm((p) => ({ ...p, odometer: String(lastEntry.odometer) }))
      }
    }
  }, [initial, smartDefault?.schedule_id])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleScheduleChange = (scheduleId: string) => {
    const sched = schedules.find((s) => s.id === parseInt(scheduleId))
    setForm((p) => ({
      ...p,
      schedule_id: scheduleId,
      title: sched ? sched.name : p.title,
    }))
    setIsCustomTitle(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      schedule_id: form.schedule_id ? parseInt(form.schedule_id) : null,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      odometer: form.odometer ? parseInt(form.odometer) : null,
      cost: form.cost || null,
      shop_name: form.shop_name.trim() || null,
      performed_at: form.performed_at,
    })
  }

  // Sort schedules: overdue first, then due_soon, then ok, then inactive
  const sortedSchedules = [...schedules].sort((a, b) => {
    const statusOrder = { overdue: 0, due_soon: 1, ok: 2 }
    const aStatus = scheduleStatusColor(a.id, health) ?? 'ok'
    const bStatus = scheduleStatusColor(b.id, health) ?? 'ok'
    if (!a.is_active && b.is_active) return 1
    if (a.is_active && !b.is_active) return -1
    return (statusOrder[aStatus as keyof typeof statusOrder] ?? 2) -
           (statusOrder[bStatus as keyof typeof statusOrder] ?? 2)
  })

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {smartDefault && !initial && (
        <Alert
          severity="warning"
          icon={<SmartIcon />}
          sx={{ mb: 2 }}
        >
          <strong>{smartDefault.schedule_name}</strong> is{' '}
          {smartDefault.status === 'overdue' ? 'overdue' : 'coming up soon'} — pre-selected below.
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Schedule selector */}
        <Grid item xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Scheduled Maintenance Item (optional)</InputLabel>
            <Select
              value={form.schedule_id}
              label="Scheduled Maintenance Item (optional)"
              onChange={(e) => handleScheduleChange(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <Typography color="text.secondary" variant="body2">— None (free-form entry) —</Typography>
              </MenuItem>
              {sortedSchedules.map((s) => {
                const status = scheduleStatusColor(s.id, health)
                return (
                  <MenuItem key={s.id} value={String(s.id)} disabled={!s.is_active}>
                    <Stack direction="row" alignItems="center" gap={1} width="100%">
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>{s.name}</Typography>
                      {status === 'overdue' && (
                        <Chip icon={<ErrorIcon />} label="Overdue" color="error" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                      {status === 'due_soon' && (
                        <Chip icon={<WarningIcon />} label="Due Soon" color="warning" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                      {!s.is_active && <Chip label="Inactive" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />}
                    </Stack>
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>

        {/* Title */}
        <Grid item xs={12}>
          <TextField
            label="Title"
            placeholder='e.g. "Oil Change", "Replaced front brake pads"'
            value={form.title}
            onChange={(e) => { set('title')(e); setIsCustomTitle(true) }}
            required
            fullWidth
            helperText={!isCustomTitle && form.schedule_id ? 'Auto-filled from schedule item — you can edit this' : undefined}
          />
        </Grid>

        {/* Date + Odometer */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Date Performed"
            type="date"
            value={form.performed_at}
            onChange={set('performed_at')}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Odometer"
            type="number"
            value={form.odometer}
            onChange={set('odometer')}
            fullWidth
            inputProps={{ min: 0 }}
            InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }}
            helperText={lastEntry?.odometer && !form.odometer ? `Last: ${lastEntry.odometer.toLocaleString()} mi` : undefined}
          />
        </Grid>

        {/* Cost + Shop */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Cost"
            type="number"
            value={form.cost}
            onChange={set('cost')}
            fullWidth
            inputProps={{ min: 0, step: '0.01' }}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Shop / Location"
            placeholder="Jiffy Lube, Home, etc."
            value={form.shop_name}
            onChange={set('shop_name')}
            fullWidth
          />
        </Grid>

        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            label="Notes"
            placeholder="Any details, part numbers, observations..."
            value={form.notes}
            onChange={set('notes')}
            fullWidth
            multiline
            minRows={3}
          />
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
