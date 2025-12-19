import { LucideIcon } from 'lucide-react'
import { CardContainer, Header, HeaderLeft, HeaderRight, Title, Content } from './Card.styles'
import { PositionProps } from '../../styles/mixins'

export interface CardProps extends PositionProps {
  title?: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  titleColor?: string
  active?: boolean
  headerRight?: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLDivElement>
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>
  onMouseUp?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>
  onTouchCancel?: React.TouchEventHandler<HTMLDivElement>
}

const Card = ({
  title,
  icon: Icon,
  children,
  className,
  titleColor,
  active = true,
  headerRight,
  onClick,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...positionProps
}: CardProps) => {
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
          <HeaderLeft>
            {Icon && <Icon size={26} color={titleColor || '#06b6d4'} />}
            <Title color={titleColor}>{title}</Title>
          </HeaderLeft>
          {headerRight ? <HeaderRight>{headerRight}</HeaderRight> : null}
        </Header>
      )}
      <Content>{children}</Content>
    </CardContainer>
  )
}

export default Card
