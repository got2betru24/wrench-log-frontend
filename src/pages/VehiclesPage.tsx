import {
  Box, Typography, Grid, Card, CardActionArea, CardContent,
  Stack, Button, Chip, CircularProgress, Alert, IconButton,
  Tooltip, Switch, FormControlLabel,
} from '@mui/material'
import {
  Add as AddIcon, DirectionsCar as CarIcon,
  Error as ErrorIcon, Warning as WarningIcon,
  CheckCircle as OkIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useVehicles, useVehicleHealth } from '../hooks'
import ScoreGauge from '../components/shared/ScoreGauge'

function VehicleListCard({ vehicleId }: { vehicleId: number }) {
  const navigate = useNavigate()
  const { data: vehicles } = useVehicles()
  const { data: health } = useVehicleHealth(vehicleId)
  const vehicle = vehicles?.find((v) => v.id === vehicleId)

  if (!vehicle) return null

  const alerts = health?.upcoming_items.filter((i) => i.status !== 'ok') ?? []
  const overdue = alerts.filter((i) => i.status === 'overdue').length
  const dueSoon = alerts.filter((i) => i.status === 'due_soon').length

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/vehicles/${vehicleId}`)}>
        <CardContent>
          <Stack direction="row" alignItems="flex-start" gap={2}>
            <Box
              sx={{
                width: 48, height: 48, borderRadius: '12px',
                backgroundColor: 'action.selected',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CarIcon sx={{ color: 'primary.main', fontSize: 26 }} />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} noWrap>{vehicle.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Typography>
              {vehicle.license_plate && (
                <Typography variant="caption" color="text.secondary">{vehicle.license_plate}</Typography>
              )}
              <Stack direction="row" gap={0.75} mt={1} flexWrap="wrap">
                {overdue > 0 && (
                  <Chip
                    icon={<ErrorIcon />}
                    label={`${overdue} overdue`}
                    color="error"
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {dueSoon > 0 && (
                  <Chip
                    icon={<WarningIcon />}
                    label={`${dueSoon} due soon`}
                    color="warning"
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
                {overdue === 0 && dueSoon === 0 && health && (
                  <Chip
                    icon={<OkIcon />}
                    label="Up to date"
                    color="success"
                    size="small"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Stack>
            </Box>
            {health && <ScoreGauge score={health.score} size={64} />}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default function VehiclesPage() {
  const navigate = useNavigate()
  const [showArchived, setShowArchived] = useState(false)
  const { data: vehicles = [], isLoading, error } = useVehicles(showArchived)

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Box sx={{ p: 3 }}><Alert severity="error">{(error as Error).message}</Alert></Box>
  }

  const active = vehicles.filter((v) => !v.archived)
  const archived = vehicles.filter((v) => v.archived)

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Vehicles</Typography>
          <Typography variant="body2" color="text.secondary">
            {active.length} active vehicle{active.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" gap={2}>
          <FormControlLabel
            control={<Switch checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} size="small" />}
            label={<Typography variant="body2">Show archived</Typography>}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vehicles/new')}>
            Add Vehicle
          </Button>
        </Stack>
      </Stack>

      {vehicles.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CarIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>No vehicles yet</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vehicles/new')}>
            Add Your First Vehicle
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {active.map((v) => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <VehicleListCard vehicleId={v.id} />
            </Grid>
          ))}
          {showArchived && archived.length > 0 && (
            <>
              <Grid item xs={12}>
                <Typography variant="overline" color="text.secondary">Archived</Typography>
              </Grid>
              {archived.map((v) => (
                <Grid item xs={12} sm={6} md={4} key={v.id}>
                  <VehicleListCard vehicleId={v.id} />
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}
    </Box>
  )
}
