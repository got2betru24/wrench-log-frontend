import {
  Card, CardContent, CardActionArea, Box, Typography, Stack,
  Chip, Divider, Tooltip, LinearProgress,
} from '@mui/material'
import {
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as OkIcon,
  AttachMoney as MoneyIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import type { VehicleHealth, UpcomingItem } from '../../types'
import ScoreGauge from '../shared/ScoreGauge'

interface Props {
  health: VehicleHealth
  vehicleName: string
  vehicleSubtitle: string
}

function StatusIcon({ status }: { status: UpcomingItem['status'] }) {
  if (status === 'overdue') return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />
  if (status === 'due_soon') return <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
  return <OkIcon sx={{ fontSize: 14, color: 'success.main' }} />
}

function statusColor(status: UpcomingItem['status']): 'error' | 'warning' | 'default' {
  if (status === 'overdue') return 'error'
  if (status === 'due_soon') return 'warning'
  return 'default'
}

export default function VehicleHealthCard({ health, vehicleName, vehicleSubtitle }: Props) {
  const navigate = useNavigate()
  const alertItems = health.upcoming_items.filter((i) => i.status !== 'ok').slice(0, 3)

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/vehicles/${health.vehicle_id}`)} sx={{ flexGrow: 1 }}>
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '10px',
                  backgroundColor: 'action.selected',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <CarIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                  {vehicleName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {vehicleSubtitle}
                </Typography>
              </Box>
            </Stack>
            <ScoreGauge score={health.score} size={72} />
          </Stack>

          {/* Stats row */}
          <Stack direction="row" gap={2} mb={2} flexWrap="wrap">
            {health.total_cost_ytd !== null && (
              <Tooltip title="Total maintenance cost this year">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    ${parseFloat(health.total_cost_ytd).toFixed(0)} YTD
                  </Typography>
                </Stack>
              </Tooltip>
            )}
            {health.estimated_daily_miles !== null && (
              <Tooltip title="Estimated daily mileage">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    ~{Math.round(health.estimated_daily_miles)} mi/day
                  </Typography>
                </Stack>
              </Tooltip>
            )}
            {health.last_entry_date && (
              <Typography variant="caption" color="text.secondary">
                Last service: {new Date(health.last_entry_date + 'T00:00:00').toLocaleDateString()}
              </Typography>
            )}
          </Stack>

          {/* Alert items */}
          {alertItems.length > 0 ? (
            <>
              <Divider sx={{ mb: 1.5 }} />
              <Stack gap={0.75}>
                {alertItems.map((item) => (
                  <Stack key={item.schedule_id} direction="row" alignItems="center" gap={1}>
                    <StatusIcon status={item.status} />
                    <Typography variant="caption" sx={{ flexGrow: 1 }} noWrap>
                      {item.schedule_name}
                    </Typography>
                    <Chip
                      label={
                        item.status === 'overdue'
                          ? item.miles_until_due !== null
                            ? `${Math.abs(item.miles_until_due).toLocaleString()} mi overdue`
                            : item.days_until_due !== null
                            ? `${Math.abs(item.days_until_due)}d overdue`
                            : 'Overdue'
                          : item.miles_until_due !== null
                          ? `${item.miles_until_due.toLocaleString()} mi`
                          : item.days_until_due !== null
                          ? `${item.days_until_due}d`
                          : 'Due soon'
                      }
                      color={statusColor(item.status)}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </>
          ) : (
            <Stack direction="row" alignItems="center" gap={1} sx={{ opacity: 0.7 }}>
              <OkIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="caption" color="success.main" fontWeight={600}>
                All maintenance up to date
              </Typography>
            </Stack>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
