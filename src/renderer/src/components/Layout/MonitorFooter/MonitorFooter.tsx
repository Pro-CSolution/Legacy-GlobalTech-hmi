import { useLocation, useNavigate } from 'react-router'
import { monitorNavigationItems } from 'monitor/navigation'
import { FooterContainer, Label, NavButton } from './MonitorFooter.styles'

const MonitorFooter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <FooterContainer>
      {monitorNavigationItems.map((item) => {
        const Icon = item.icon
        return (
          <NavButton
            key={item.id}
            $active={currentPath === item.route}
            onClick={() => navigate(item.route, { flushSync: true })}
          >
            <Icon size={30} />
            <Label>{item.label}</Label>
          </NavButton>
        )
      })}
    </FooterContainer>
  )
}

export default MonitorFooter
