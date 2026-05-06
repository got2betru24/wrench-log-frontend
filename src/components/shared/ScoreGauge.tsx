import { Box, Typography, useTheme } from '@mui/material'

interface Props {
  score: number   // 0–100
  size?: number
}

export default function ScoreGauge({ score, size = 96 }: Props) {
  const theme = useTheme()

  const color =
    score >= 80
      ? theme.palette.gauge.good
      : score >= 50
      ? theme.palette.gauge.fair
      : theme.palette.gauge.attention

  // Arc from 210° to 330° (240° sweep)
  const cx = 50, cy = 54, r = 38
  const startAngle = 210
  const totalSweep = 240
  const sweepAngle = (score / 100) * totalSweep

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const arcX = (angle: number) => cx + r * Math.cos(toRad(angle))
  const arcY = (angle: number) => cy + r * Math.sin(toRad(angle))

  const endAngle = startAngle + sweepAngle
  const largeArc = sweepAngle > 180 ? 1 : 0

  const trackPath = `
    M ${arcX(startAngle)} ${arcY(startAngle)}
    A ${r} ${r} 0 1 1 ${arcX(startAngle + totalSweep)} ${arcY(startAngle + totalSweep)}
  `
  const scorePath = sweepAngle > 0 ? `
    M ${arcX(startAngle)} ${arcY(startAngle)}
    A ${r} ${r} 0 ${largeArc} 1 ${arcX(endAngle)} ${arcY(endAngle)}
  ` : ''

  return (
    <Box sx={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <svg viewBox="0 0 100 90" width={size} height={size * 0.9}>
        {/* Track */}
        <path
          d={trackPath}
          fill="none"
          stroke={theme.palette.gauge.track}
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Score arc */}
        {scorePath && (
          <path
            d={scorePath}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
          />
        )}
        {/* Score text */}
        <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize="20" fontWeight="700"
          style={{ fontFamily: '"DM Mono", monospace' }}>
          {score}
        </text>
      </svg>
    </Box>
  )
}
