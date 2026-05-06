import { Chip } from '@mui/material'
import type { HealthColor } from '../../types'

interface Props {
  label: string
  color: HealthColor
  size?: 'small' | 'medium'
}

export default function HealthChip({ label, color, size = 'small' }: Props) {
  return (
    <Chip
      label={label}
      color={color}
      size={size}
      variant="filled"
      sx={{ fontWeight: 700, letterSpacing: '0.03em' }}
    />
  )
}
