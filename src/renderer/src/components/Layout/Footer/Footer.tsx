import { LayoutDashboard, Bell, LineChart, List, Layers, Thermometer, Fan } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { FooterContainer, NavButton, Label } from './Footer.styles'

const Footer = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const iconsSize = 40

  // Simple mapping for active state
  const currentPath = location.pathname
  const go = (to: string) => navigate(to, { flushSync: true })

  return (
    <FooterContainer>
      <NavButton $active={currentPath === '/'} onClick={() => go('/')}>
        <LayoutDashboard size={iconsSize} />
        <Label>MAIN</Label>
      </NavButton>

      <NavButton $active={currentPath === '/alarms'} onClick={() => go('/alarms')}>
        <Bell size={iconsSize} />
        <Label>ALARMS</Label>
      </NavButton>

      <NavButton $active={currentPath === '/trends'} onClick={() => go('/trends')}>
        <LineChart size={iconsSize} />
        <Label>TRENDS</Label>
      </NavButton>

      <NavButton $active={currentPath === '/temperatures'} onClick={() => go('/temperatures')}>
        <Thermometer size={iconsSize} />
        <Label>TEMPS</Label>
      </NavButton>

      <NavButton $active={currentPath === '/cooling-system'} onClick={() => go('/cooling-system')}>
        <Fan size={iconsSize} />
        <Label>COOLING</Label>
      </NavButton>

      <NavButton
        $active={currentPath === '/drive-parameters'}
        onClick={() => go('/drive-parameters')}
      >
        <List size={iconsSize} />
        <Label>PARAMS</Label>
      </NavButton>

      <NavButton $active={currentPath === '/motor-profiles'} onClick={() => go('/motor-profiles')}>
        <Layers size={iconsSize} />
        <Label>PROFILES</Label>
      </NavButton>
    </FooterContainer>
  )
}

export default Footer
