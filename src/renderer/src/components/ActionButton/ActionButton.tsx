import { type PointerEventHandler } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './ActionButton.styles'
import { PositionProps } from '../../styles/mixins'

export interface ActionButtonProps extends PositionProps {
  label: string
  color?: 'green' | 'red' | 'yellow' | 'slate'
  onClick?: () => void
  onPointerDown?: PointerEventHandler<HTMLButtonElement>
  onPointerUp?: PointerEventHandler<HTMLButtonElement>
  onPointerCancel?: PointerEventHandler<HTMLButtonElement>
  onLostPointerCapture?: PointerEventHandler<HTMLButtonElement>
  icon?: LucideIcon
  active?: boolean
  disabled?: boolean
}

const ActionButton = ({
  label,
  color = 'slate',
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  icon: Icon,
  active = false,
  disabled = false,
  ...positionProps
}: ActionButtonProps) => {
  return (
    <Button
      color={color}
      active={active}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={onLostPointerCapture}
      disabled={disabled}
      {...positionProps}
    >
      {Icon && <Icon size={24} />}
      <span>{label}</span>
    </Button>
  )
}

export default ActionButton
