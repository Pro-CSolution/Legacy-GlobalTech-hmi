import React from 'react'
import { LayoutDashboard, Thermometer, Wind, LineChart, Menu } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router'
import { FooterContainer, NavButton, Label, FeatureButton } from './Footer.styles'

const Footer: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const iconsSize = 45

  // Simple mapping for active state
  const currentPath = location.pathname

  return (
    <FooterContainer>
      <NavButton active={currentPath === '/'} onClick={() => navigate('/')}>
        <LayoutDashboard size={iconsSize} />
        <Label>MAIN</Label>
      </NavButton>

      <NavButton active={currentPath === '/temps'} onClick={() => navigate('/temps')}>
        <Thermometer size={iconsSize} />
        <Label>TEMPERATURES</Label>
      </NavButton>

      <NavButton active={currentPath === '/coolant'} onClick={() => navigate('/coolant')}>
        <Wind size={iconsSize} />
        <Label>COOLING</Label>
      </NavButton>

      <NavButton active={currentPath === '/trends'} onClick={() => navigate('/trends')}>
        <LineChart size={iconsSize} />
        <Label>TRENDS 1</Label>
      </NavButton>

      <FeatureButton>
        <LineChart size={iconsSize} />
        <Label>ELEC TREND 1</Label>
      </FeatureButton>

      {/* Config/Menu */}
      <NavButton style={{ marginLeft: 'auto', background: '#0f172a' }}>
        <Menu size={iconsSize} />
      </NavButton>
    </FooterContainer>
  )
}

export default Footer
