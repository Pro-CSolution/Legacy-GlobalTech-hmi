import React from 'react'
import { PanelContainer } from './Panel.styles'
import { PositionProps } from '../../styles/mixins'

export interface PanelProps extends PositionProps {
  children: React.ReactNode
  className?: string
}

const Panel: React.FC<PanelProps> = ({ children, className, ...positionProps }) => {
  return (
    <PanelContainer className={className} {...positionProps}>
      {children}
    </PanelContainer>
  )
}

export default Panel
