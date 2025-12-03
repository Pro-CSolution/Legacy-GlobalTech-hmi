import { FC } from 'react'
import { BottomNavContainer, NavButton, ButtonIcon, ButtonLabel } from './BottomNav.styles'
import { useNavigate, useLocation } from 'react-router'
import type { IconType } from 'react-icons'

interface NavButtonData {
  id: string
  label: string
  icon: IconType
  variant: 'primary' | 'secondary'
  route: string
}

interface BottomNavProps {
  buttons?: NavButtonData[]
}

const BottomNav: FC<BottomNavProps> = ({ buttons }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Default navigation buttons (can be overridden)
  // Note: In production, you should use real icons from react-icons
  const defaultButtons: NavButtonData[] = buttons || []

  const handleButtonClick = (button: NavButtonData): void => {
    navigate(button.route)
  }

  const isActiveRoute = (route: string): boolean => {
    return location.pathname === route
  }

  return (
    <BottomNavContainer>
      {defaultButtons.map((button) => {
        const IconComponent = button.icon
        return (
          <NavButton
            key={button.id}
            variant={button.variant}
            onClick={() => handleButtonClick(button)}
            $isActive={isActiveRoute(button.route)}
          >
            <ButtonIcon as={IconComponent} />
            <ButtonLabel>{button.label}</ButtonLabel>
          </NavButton>
        )
      })}
    </BottomNavContainer>
  )
}

export default BottomNav
