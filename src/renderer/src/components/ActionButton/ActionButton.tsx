import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from './ActionButton.styles'
import { PositionProps } from '../../styles/mixins'

export interface ActionButtonProps extends PositionProps {
  label: string
  color?: 'green' | 'red' | 'yellow' | 'slate'
  onClick?: () => void
  icon?: LucideIcon
  active?: boolean
  disabled?: boolean
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  color = 'slate',
  onClick,
  icon: Icon,
  active = false,
  disabled = false,
  ...positionProps
}) => {
  return (
    <Button color={color} active={active} onClick={onClick} disabled={disabled} {...positionProps}>
      {Icon && <Icon size={24} />}
      <span>{label}</span>
    </Button>
  )
}

export default ActionButton
