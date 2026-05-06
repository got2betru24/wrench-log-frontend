import { useState, useEffect } from 'react'
import {
  Box, TextField, Button, Grid, Typography, CircularProgress,
  Alert, InputAdornment, Stack,
} from '@mui/material'
import {
  DirectionsCar as CarIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import type { Vehicle, VehicleCreate } from '../../types'

interface Props {
  initial?: Vehicle
  onSubmit: (data: VehicleCreate) => Promise<void>
  loading?: boolean
  error?: string | null
}

const CURRENT_YEAR = new Date().getFullYear()

export default function VehicleForm({ initial, onSubmit, loading = false, error }: Props) {
  const [form, setForm] = useState({
    name: '', make: '', model: '',
    year: String(CURRENT_YEAR), vin: '', color: '', license_plate: '', notes: '',
  })

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        make: initial.make,
        model: initial.model,
        year: String(initial.year),
        vin: initial.vin ?? '',
        color: initial.color ?? '',
        license_plate: initial.license_plate ?? '',
        notes: initial.notes ?? '',
      })
    }
  }, [initial])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: form.name.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: parseInt(form.year),
      vin: form.vin.trim() || null,
      color: form.color.trim() || null,
      license_plate: form.license_plate.trim() || null,
      notes: form.notes.trim() || null,
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Nickname / Name"
            placeholder='e.g. "Daily Driver" or "The Truck"'
            value={form.name}
            onChange={set('name')}
            required
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><CarIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={12} sm={5}>
          <TextField label="Make" placeholder="Toyota" value={form.make} onChange={set('make')} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField label="Model" placeholder="Camry" value={form.model} onChange={set('model')} required fullWidth />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Year"
            type="number"
            value={form.year}
            onChange={set('year')}
            required
            fullWidth
            inputProps={{ min: 1900, max: CURRENT_YEAR + 2 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="VIN"
            placeholder="17-character VIN (optional)"
            value={form.vin}
            onChange={set('vin')}
            fullWidth
            inputProps={{ maxLength: 17 }}
            helperText={form.vin ? `${form.vin.length}/17` : undefined}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="Color" placeholder="Silver" value={form.color} onChange={set('color')} fullWidth />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField label="License Plate" value={form.license_plate} onChange={set('license_plate')} fullWidth />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Notes"
            placeholder="Any notes about this vehicle..."
            value={form.notes}
            onChange={set('notes')}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !form.name || !form.make || !form.model || !form.year}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
              size="large"
            >
              {initial ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
