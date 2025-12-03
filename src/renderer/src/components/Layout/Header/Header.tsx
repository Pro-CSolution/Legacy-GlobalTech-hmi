import React, { useState, useEffect } from 'react'
import {
  HeaderContainer,
  LeftSection,
  Badge,
  BadgeLabel,
  BadgeValue,
  Divider,
  InfoText,
  RightSection,
  Time,
  DateText
} from './Header.styles'

const Header: React.FC = () => {
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <HeaderContainer>
      <LeftSection>
        <Badge>
          <BadgeLabel>Banco de Prueba</BadgeLabel>
          <BadgeValue>TEST STAND A</BadgeValue>
        </Badge>
        <Divider />
        <InfoText>
          <span>PROYECTO: RTE-002</span>
          <span className="separator">|</span>
          <span>IP: 192.168.10.24</span>
        </InfoText>
      </LeftSection>

      <RightSection>
        <Time>{date.toLocaleTimeString([], { hour12: false })}</Time>
        <DateText>{date.toLocaleDateString()}</DateText>
      </RightSection>
    </HeaderContainer>
  )
}

export default Header
