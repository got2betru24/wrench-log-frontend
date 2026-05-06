import {
  Box, Typography, Grid, Stack, Chip, Paper,
  CircularProgress, Alert, Button, Divider,
} from '@mui/material'
import {
  DirectionsCar as CarIcon, Error as ErrorIcon,
  Warning as WarningIcon, Add as AddIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks'
import VehicleHealthCard from '../components/dashboard/VehicleHealthCard'
import AlertsPanel from '../components/dashboard/AlertsPanel'
import type { UpcomingItem } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{(error as Error).message}</Alert>
      </Box>
    )
  }

  if (!data || data.total_vehicles === 0) {
    return (
      <Box sx={{ p: 4, maxWidth: 480, mx: 'auto', textAlign: 'center', mt: 8 }}>
        <Box
          sx={{
            width: 80, height: 80, borderRadius: '20px', mx: 'auto', mb: 3,
            background: 'linear-gradient(135deg, #f59e0b22, #f59e0b44)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
        <Typography variant="h5" fontWeight={700} mb={1}>No vehicles yet</Typography>
        <Typography color="text.secondary" mb={3}>
          Add your first vehicle to start tracking maintenance, costs, and health scores.
        </Typography>
        <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => navigate('/vehicles/new')}>
          Add Your First Vehicle
        </Button>
      </Box>
    )
  }

  // Collect all alert items across all vehicles
  const allAlerts: UpcomingItem[] = data.vehicles_health.flatMap((vh) =>
    vh.upcoming_items.filter((i) => i.status !== 'ok')
  )

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Fleet overview and maintenance alerts
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vehicles/new')}>
          Add Vehicle
        </Button>
      </Stack>

      {/* Summary stats */}
      <Grid container spacing={2} mb={3}>
        {[
          {
            label: 'Vehicles',
            value: data.total_vehicles,
            icon: <CarIcon />,
            color: 'primary.main',
          },
          {
            label: 'Overdue',
            value: data.overdue_count,
            icon: <ErrorIcon />,
            color: data.overdue_count > 0 ? 'error.main' : 'text.secondary',
          },
          {
            label: 'Due Soon',
            value: data.due_soon_count,
            icon: <WarningIcon />,
            color: data.due_soon_count > 0 ? 'warning.main' : 'text.secondary',
          },
          {
            label: `${new Date().getFullYear()} Cost`,
            value: `$${parseFloat(data.total_cost_ytd || '0').toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            icon: <MoneyIcon />,
            color: 'text.primary',
          },
        ].map((stat) => (
          <Grid item xs={6} sm={3} key={stat.label}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                <Box sx={{ color: stat.color, display: 'flex' }}>{stat.icon}</Box>
                <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                  {stat.label}
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700} sx={{ color: stat.color, fontFamily: '"DM Mono", monospace' }}>
                {stat.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Vehicle health cards */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h6" fontWeight={700} mb={2}>Vehicles</Typography>
          <Grid container spacing={2}>
            {data.vehicles_health.map((vh) => {
              // find vehicle name from health data (vehicle_name is on upcoming_items)
              const name = vh.upcoming_items[0]?.vehicle_name ?? `Vehicle ${vh.vehicle_id}`
              return (
                <Grid item xs={12} sm={6} key={vh.vehicle_id}>
                  <VehicleHealthCard
                    health={vh}
                    vehicleName={name}
                    vehicleSubtitle=""
                  />
                </Grid>
              )
            })}
          </Grid>
        </Grid>

        {/* Alerts panel */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Alerts
            {allAlerts.length > 0 && (
              <Chip
                label={allAlerts.length}
                size="small"
                color={data.overdue_count > 0 ? 'error' : 'warning'}
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
          <AlertsPanel items={allAlerts} />
        </Grid>
      </Grid>
    </Box>
  )
}
