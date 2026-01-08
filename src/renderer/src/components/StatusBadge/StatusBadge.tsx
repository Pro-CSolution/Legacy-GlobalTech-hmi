import { Power, CheckCircle, AlertTriangle, AlertOctagon, LucideIcon } from 'lucide-react'
import { Container, Label, Badge, StatusText } from './StatusBadge.styles'
import { PositionProps } from '../../styles/mixins'

export type StatusType = 'running' | 'stopped' | 'warning' | 'fault' | 'local' | 'closed'

export interface StatusBadgeProps extends PositionProps {
  label: string
  status: string // Can be mapped to StatusType or custom string
  onLabel?: string
  offLabel?: string
  faultLabel?: string
  warnLabel?: string
  type?: 'standard' | 'warning'
}

const StatusBadge = ({
  label,
  status,
  onLabel = 'ON',
  offLabel = 'OFF',
  faultLabel = 'FALLA',
  warnLabel = 'WARNING',
  ...positionProps
}: StatusBadgeProps) => {
  let Icon: LucideIcon = Power
  let text = offLabel
  const s = status.toLowerCase()

  if (['on', 'ok', 'local', 'closed', 'running'].includes(s)) {
    Icon = CheckCircle
    text = onLabel
  } else if (['fault', 'high', 'critical'].includes(s)) {
    Icon = AlertOctagon
    text = faultLabel
  } else if (['warning', 'warn'].includes(s)) {
    Icon = AlertTriangle
    text = warnLabel
  }

  return (
    <Container {...positionProps}>
      {label && <Label>{label}</Label>}
      <Badge status={status}>
        <StatusText>{text}</StatusText>
        <Icon size={20} />
      </Badge>
    </Container>
  )
}

export default StatusBadge
