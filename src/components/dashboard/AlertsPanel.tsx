import {
  Box, Typography, Stack, Chip, Paper, Divider,
  List, ListItem, ListItemText, ListItemIcon, Button,
} from '@mui/material'
import {
  Error as ErrorIcon, Warning as WarningIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import type { UpcomingItem } from '../../types'

interface Props {
  items: UpcomingItem[]
}

export default function AlertsPanel({ items }: Props) {
  const navigate = useNavigate()
  const overdue = items.filter((i) => i.status === 'overdue')
  const dueSoon = items.filter((i) => i.status === 'due_soon')

  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="success.main" fontWeight={600}>
          ✓ No alerts — all vehicles are up to date
        </Typography>
      </Paper>
    )
  }

  const Section = ({ title, icon, items: sectionItems }: {
    title: string; icon: React.ReactNode; items: UpcomingItem[]
  }) => (
    sectionItems.length > 0 ? (
      <Box>
        <Stack direction="row" alignItems="center" gap={1} mb={1}>
          {icon}
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Chip label={sectionItems.length} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
        </Stack>
        <List disablePadding>
          {sectionItems.map((item, i) => (
            <Box key={`${item.vehicle_id}-${item.schedule_id}`}>
              {i > 0 && <Divider />}
              <ListItem
                disablePadding
                sx={{ py: 1 }}
                secondaryAction={
                  <Button
                    size="small"
                    endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
                    onClick={() => navigate(`/vehicles/${item.vehicle_id}`)}
                    sx={{ fontSize: '0.72rem' }}
                  >
                    Log It
                  </Button>
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="body2" fontWeight={600}>{item.schedule_name}</Typography>
                      <Typography variant="caption" color="text.secondary">·</Typography>
                      <Typography variant="caption" color="text.secondary">{item.vehicle_name}</Typography>
                    </Stack>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.last_performed
                        ? `Last done: ${new Date(item.last_performed + 'T00:00:00').toLocaleDateString()}`
                        : 'Never performed'}
                      {item.miles_until_due !== null && (
                        <> · {item.miles_until_due < 0
                          ? `${Math.abs(item.miles_until_due).toLocaleString()} mi overdue`
                          : `${item.miles_until_due.toLocaleString()} mi remaining`}
                        </>
                      )}
                      {item.days_until_due !== null && (
                        <> · {item.days_until_due < 0
                          ? `${Math.abs(item.days_until_due)} days overdue`
                          : `Due in ${item.days_until_due} days`}
                        </>
                      )}
                    </Typography>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Box>
    ) : null
  )

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack gap={2.5}>
        <Section
          title="Overdue"
          icon={<ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />}
          items={overdue}
        />
        {overdue.length > 0 && dueSoon.length > 0 && <Divider />}
        <Section
          title="Due Soon"
          icon={<WarningIcon sx={{ fontSize: 16, color: 'warning.main' }} />}
          items={dueSoon}
        />
      </Stack>
    </Paper>
  )
}
