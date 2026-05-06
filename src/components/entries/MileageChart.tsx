import { Box, Typography, useTheme, Paper } from '@mui/material'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { MileagePoint } from '../../types'

interface Props {
  data: MileagePoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, minWidth: 140 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {new Date(label + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
        <Typography variant="subtitle2" color="primary.main">
          {payload[0].value.toLocaleString()} mi
        </Typography>
      </Paper>
    )
  }
  return null
}

export default function MileageChart({ data }: Props) {
  const theme = useTheme()

  if (data.length < 2) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Log at least 2 entries with odometer readings to see the mileage trend.
        </Typography>
      </Box>
    )
  }

  const chartData = data.map((d) => ({
    date: d.performed_at,
    odometer: d.odometer,
  }))

  // Projected next 90 days
  if (data.length >= 2) {
    const oldest = data[0], newest = data[data.length - 1]
    const days = (new Date(newest.performed_at).getTime() - new Date(oldest.performed_at).getTime()) / 86400000
    if (days > 0) {
      const rate = (newest.odometer - oldest.odometer) / days
      const future = new Date(newest.performed_at)
      future.setDate(future.getDate() + 90)
      chartData.push({
        date: future.toISOString().split('T')[0],
        odometer: Math.round(newest.odometer + rate * 90),
      })
    }
  }

  const tickFormatter = (value: string) => {
    const d = new Date(value + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const yFormatter = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)

  const projectionStart = data[data.length - 1].performed_at

  return (
    <Box>
      <Typography variant="overline" color="text.secondary" display="block" mb={1}>
        Odometer History
      </Typography>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={yFormatter}
            tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={projectionStart}
            stroke={theme.palette.divider}
            strokeDasharray="4 4"
            label={{ value: 'projected →', fill: theme.palette.text.secondary, fontSize: 10, position: 'top' }}
          />
          <Line
            type="monotone"
            dataKey="odometer"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={(props: any) => {
              const isProjected = props.payload.date > projectionStart
              if (isProjected) return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill={theme.palette.primary.main} strokeDasharray="3 3" fillOpacity={0.4} />
              return <circle key={props.key} cx={props.cx} cy={props.cy} r={3} fill={theme.palette.primary.main} />
            }}
            activeDot={{ r: 5, fill: theme.palette.primary.main }}
          />
        </LineChart>
      </ResponsiveContainer>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
        Dashed projection = estimated next 90 days based on average usage
      </Typography>
    </Box>
  )
}
