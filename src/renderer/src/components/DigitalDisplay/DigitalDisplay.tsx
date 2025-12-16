
import { Container, GlowEffect, Label, ValueContainer, Value, Unit } from './DigitalDisplay.styles'
import { PositionProps } from '../../styles/mixins'

export interface DigitalDisplayProps extends PositionProps {
  label: string
  value: string | number
  unit?: string
  size?: 'normal' | 'large'
}

const DigitalDisplay = ({
  label,
  value,
  unit,
  size = 'large',
  ...positionProps
}: DigitalDisplayProps) => {
  return (
    <Container {...positionProps}>
      <GlowEffect />
      <Label>{label}</Label>
      <ValueContainer>
        <Value size={size}>{value}</Value>
        {unit && <Unit>{unit}</Unit>}
      </ValueContainer>
    </Container>
  )
}

export default DigitalDisplay
