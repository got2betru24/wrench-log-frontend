import { useState } from 'react'
import {
  Box, Typography, Stack, Chip, IconButton, Tooltip,
  Paper, Divider, Button, CircularProgress, Collapse,
} from '@mui/material'
import {
  Build as BuildIcon, Edit as EditIcon, Delete as DeleteIcon,
  AttachFile as AttachIcon, ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon, Speed as SpeedIcon,
  AttachMoney as MoneyIcon, Store as ShopIcon,
} from '@mui/icons-material'
import type { MaintenanceEntry, MaintenanceSchedule } from '../../types'
import AttachmentList from './AttachmentList'

interface Props {
  entries: MaintenanceEntry[]
  schedules: MaintenanceSchedule[]
  vehicleId: number
  onEdit: (entry: MaintenanceEntry) => void
  onDelete: (entryId: number) => void
  deleting?: number | null
}

function EntryRow({ entry, schedules, vehicleId, onEdit, onDelete, deleting }: {
  entry: MaintenanceEntry
  schedules: MaintenanceSchedule[]
  vehicleId: number
  onEdit: (e: MaintenanceEntry) => void
  onDelete: (id: number) => void
  deleting?: number | null
}) {
  const [expanded, setExpanded] = useState(false)
  const schedule = schedules.find((s) => s.id === entry.schedule_id)
  const date = new Date(entry.performed_at + 'T00:00:00')

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Timeline line */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0, pt: 0.5 }}>
        <Box
          sx={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: schedule ? 'primary.main' : 'action.selected',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: schedule ? '0 0 8px rgba(245,158,11,0.4)' : 'none',
          }}
        >
          <BuildIcon sx={{ fontSize: 14, color: schedule ? '#0f1117' : 'text.secondary' }} />
        </Box>
        <Box sx={{ width: 1, flexGrow: 1, backgroundColor: 'divider', mt: 0.5 }} />
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, pb: 3, minWidth: 0 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1} flexWrap="wrap">
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={700}>{entry.title}</Typography>
              {schedule && (
                <Chip label="Scheduled" size="small" sx={{ height: 16, fontSize: '0.6rem' }} variant="outlined" color="primary" />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
          <Stack direction="row" alignItems="center" gap={0.5} flexShrink={0}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(entry)}>
                <EditIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(entry.id)} disabled={deleting === entry.id}>
                {deleting === entry.id ? <CircularProgress size={14} /> : <DeleteIcon sx={{ fontSize: 15 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Stats row */}
        <Stack direction="row" gap={2} mt={0.75} flexWrap="wrap">
          {entry.odometer !== null && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <SpeedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {entry.odometer.toLocaleString()} mi
              </Typography>
            </Stack>
          )}
          {entry.cost !== null && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <MoneyIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                ${parseFloat(entry.cost).toFixed(2)}
              </Typography>
            </Stack>
          )}
          {entry.shop_name && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <ShopIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">{entry.shop_name}</Typography>
            </Stack>
          )}
          {entry.attachments.length > 0 && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <AttachIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {entry.attachments.length} file{entry.attachments.length !== 1 ? 's' : ''}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Expandable: notes + attachments */}
        {(entry.notes || entry.attachments.length > 0) && (
          <Box mt={1}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
              sx={{ fontSize: '0.72rem', color: 'text.secondary', px: 0 }}
            >
              {expanded ? 'Hide details' : 'Show details'}
            </Button>
            <Collapse in={expanded}>
              <Box mt={1} sx={{ pl: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                {entry.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                    {entry.notes}
                  </Typography>
                )}
                {entry.attachments.length > 0 && (
                  <AttachmentList entryId={entry.id} attachments={entry.attachments} vehicleId={vehicleId} />
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default function EntryTimeline({ entries, schedules, vehicleId, onEdit, onDelete, deleting }: Props) {
  if (entries.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <BuildIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography color="text.secondary">No maintenance logged yet.</Typography>
        <Typography variant="body2" color="text.secondary">Click "Log Maintenance" to add your first entry.</Typography>
      </Paper>
    )
  }

  // Group by year
  const byYear = entries.reduce<Record<number, MaintenanceEntry[]>>((acc, e) => {
    const year = parseInt(e.performed_at.split('-')[0])
    if (!acc[year]) acc[year] = []
    acc[year].push(e)
    return acc
  }, {})

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <Box>
      {years.map((year) => (
        <Box key={year} mb={1}>
          <Stack direction="row" alignItems="center" gap={2} mb={2}>
            <Typography variant="overline" color="text.secondary">{year}</Typography>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {byYear[year].length} {byYear[year].length === 1 ? 'entry' : 'entries'}
            </Typography>
          </Stack>
          {byYear[year].map((entry) => (
            <EntryRow
              key={entry.id}
              entry={entry}
              schedules={schedules}
              vehicleId={vehicleId}
              onEdit={onEdit}
              onDelete={onDelete}
              deleting={deleting}
            />
          ))}
        </Box>
      ))}
    </Box>
  )
}
