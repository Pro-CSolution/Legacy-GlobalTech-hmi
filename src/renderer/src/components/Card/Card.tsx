import React from 'react'
import { LucideIcon } from 'lucide-react'
import { CardContainer, Header, Title, Content } from './Card.styles'
import { PositionProps } from '../../styles/mixins'

export interface CardProps extends PositionProps {
  title?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  titleColor?: string
  active?: boolean
}

const Card: React.FC<CardProps> = ({
  title,
  icon: Icon,
  children,
  className,
  titleColor,
  active = true,
  ...positionProps
}) => {
  return (
    <CardContainer active={active} className={className} {...positionProps}>
      {title && (
        <Header>
          {Icon && <Icon size={26} color={titleColor || '#06b6d4'} />}
          <Title color={titleColor}>{title}</Title>
        </Header>
      )}
      <Content>{children}</Content>
    </CardContainer>
  )
}

export default Card
