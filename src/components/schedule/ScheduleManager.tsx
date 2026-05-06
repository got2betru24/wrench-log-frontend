import { useState } from 'react'
import {
  Box, Typography, Stack, Button, IconButton, Chip,
  Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Switch, FormControlLabel, Tooltip,
  CircularProgress, Alert, Paper,
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  AutoAwesome as MagicIcon,
} from '@mui/icons-material'
import {
  useSchedules, useCreateSchedule, useUpdateSchedule,
  useDeleteSchedule, useSeedTemplates,
} from '../../hooks'
import type { MaintenanceSchedule, ScheduleCreate } from '../../types'
import ConfirmDialog from '../shared/ConfirmDialog'

interface Props { vehicleId: number }

const emptyForm = (): ScheduleCreate => ({
  name: '', description: null, interval_miles: null,
  interval_months: null, estimated_cost: null, is_active: true, sort_order: 0,
})

export default function ScheduleManager({ vehicleId }: Props) {
  const { data: schedules = [], isLoading } = useSchedules(vehicleId)
  const createMut = useCreateSchedule(vehicleId)
  const updateMut = useUpdateSchedule(vehicleId)
  const deleteMut = useDeleteSchedule(vehicleId)
  const seedMut   = useSeedTemplates(vehicleId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MaintenanceSchedule | null>(null)
  const [form, setForm] = useState<ScheduleCreate>(emptyForm())
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setFormError(null); setDialogOpen(true) }
  const openEdit = (s: MaintenanceSchedule) => {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description,
      interval_miles: s.interval_miles,
      interval_months: s.interval_months,
      estimated_cost: s.estimated_cost ? parseFloat(s.estimated_cost) as any : null,
      is_active: s.is_active,
      sort_order: s.sort_order,
    })
    setFormError(null)
    setDialogOpen(true)
  }

  const set = (field: keyof ScheduleCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setForm((p) => ({
      ...p,
      [field]: raw === '' ? null : ['interval_miles','interval_months','sort_order'].includes(field)
        ? parseInt(raw) : field === 'estimated_cost' ? raw : raw,
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('Name is required'); return }
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, payload: form })
      } else {
        await createMut.mutateAsync(form)
      }
      setDialogOpen(false)
    } catch (e: any) {
      setFormError(e.message)
    }
  }

  const handleSeed = async () => {
    await seedMut.mutateAsync()
  }

  if (isLoading) return <CircularProgress size={24} />

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Maintenance Schedule</Typography>
        <Stack direction="row" gap={1}>
          {schedules.length === 0 && (
            <Button
              variant="outlined"
              startIcon={seedMut.isPending ? <CircularProgress size={14} /> : <MagicIcon />}
              onClick={handleSeed}
              disabled={seedMut.isPending}
              size="small"
            >
              Load Common Items
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} size="small">
            Add Item
          </Button>
        </Stack>
      </Stack>

      {schedules.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" mb={1}>No schedule items yet.</Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Load Common Items" to pre-fill with typical maintenance tasks, or add them manually.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Every (miles)</TableCell>
                <TableCell align="right">Every (months)</TableCell>
                <TableCell align="right">Est. Cost</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id} hover sx={{ opacity: s.is_active ? 1 : 0.4 }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
                    {s.description && (
                      <Typography variant="caption" color="text.secondary">{s.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {s.interval_miles ? s.interval_miles.toLocaleString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    {s.interval_months ?? '—'}
                  </TableCell>
                  <TableCell align="right">
                    {s.estimated_cost ? `$${parseFloat(s.estimated_cost).toFixed(0)}` : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={s.is_active ? 'Active' : 'Off'}
                      color={s.is_active ? 'success' : 'default'}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(s)}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(s.id)}>
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Schedule Item' : 'Add Schedule Item'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField label="Name" value={form.name} onChange={set('name')} fullWidth required />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description (optional)" value={form.description ?? ''} onChange={set('description')} fullWidth multiline minRows={2} />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Interval (miles)"
                type="number"
                value={form.interval_miles ?? ''}
                onChange={set('interval_miles')}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="e.g. 5000 for every 5,000 mi"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Interval (months)"
                type="number"
                value={form.interval_months ?? ''}
                onChange={set('interval_months')}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="e.g. 6 for every 6 months"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Estimated Cost ($)"
                type="number"
                value={form.estimated_cost ?? ''}
                onChange={set('estimated_cost')}
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit" variant="outlined">Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={createMut.isPending || updateMut.isPending}
            startIcon={(createMut.isPending || updateMut.isPending) ? <CircularProgress size={14} /> : undefined}
          >
            {editing ? 'Save Changes' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Schedule Item"
        message="This will remove the schedule item. Past maintenance entries linked to it will remain."
        confirmLabel="Delete"
        loading={deleteMut.isPending}
        onConfirm={async () => {
          if (deleteTarget) { await deleteMut.mutateAsync(deleteTarget); setDeleteTarget(null) }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
