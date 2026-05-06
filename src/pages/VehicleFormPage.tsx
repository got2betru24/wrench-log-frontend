import { useState } from 'react'
import {
  Box, Typography, Stack, IconButton, Tooltip, Breadcrumbs,
  Link, Alert, Paper,
} from '@mui/material'
import { ArrowBack as BackIcon } from '@mui/icons-material'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import { useVehicle, useCreateVehicle, useUpdateVehicle } from '../hooks'
import VehicleForm from '../components/vehicles/VehicleForm'
import type { VehicleCreate } from '../types'

export default function VehicleFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const vehicleId = id ? parseInt(id) : 0

  const { data: vehicle, isLoading } = useVehicle(vehicleId)
  const createMut = useCreateVehicle()
  const updateMut = useUpdateVehicle(vehicleId)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: VehicleCreate) => {
    setError(null)
    try {
      if (isEdit) {
        await updateMut.mutateAsync(data)
        navigate(`/vehicles/${vehicleId}`)
      } else {
        const created = await createMut.mutateAsync(data)
        navigate(`/vehicles/${created.id}`)
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" underline="hover" color="text.secondary" variant="body2">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/vehicles" underline="hover" color="text.secondary" variant="body2">
          Vehicles
        </Link>
        <Typography variant="body2" color="text.primary">
          {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        </Typography>
      </Breadcrumbs>

      <Stack direction="row" alignItems="center" gap={1} mb={3}>
        <Tooltip title="Back">
          <IconButton onClick={() => navigate(isEdit ? `/vehicles/${vehicleId}` : '/vehicles')} size="small">
            <BackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" fontWeight={700}>
          {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <VehicleForm
          initial={isEdit ? vehicle : undefined}
          onSubmit={handleSubmit}
          loading={createMut.isPending || updateMut.isPending}
          error={error}
        />
      </Paper>
    </Box>
  )
}
