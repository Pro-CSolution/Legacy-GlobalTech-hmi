import { FC } from 'react'
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
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>
  onTouchCancel?: React.TouchEventHandler<HTMLDivElement>
}

const Card: FC<CardProps> = ({
  title,
  icon: Icon,
  children,
  className,
  titleColor,
  active = true,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...positionProps
}) => {
  return (
    <CardContainer
      active={active}
      className={className}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
      {...positionProps}
    >
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
