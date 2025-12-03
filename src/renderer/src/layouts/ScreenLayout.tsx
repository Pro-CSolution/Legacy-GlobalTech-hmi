import { FC } from 'react'
import { HMI_CONFIG } from 'config/constants'
import HMIContainer from 'components/HMIContainer'
import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import { ContentContainer, LayoutWrapper } from './ScreenLayout.styles'

interface ScreenLayoutProps {
  children: React.ReactNode
}

const ScreenLayout: FC<ScreenLayoutProps> = ({ children }) => {
  return (
    <HMIContainer
      baseWidth={HMI_CONFIG.SCREEN.BASE_WIDTH}
      baseHeight={HMI_CONFIG.SCREEN.BASE_HEIGHT}
    >
      <LayoutWrapper>
        <Header />
        <ContentContainer>{children}</ContentContainer>
        <Footer />
      </LayoutWrapper>
    </HMIContainer>
  )
}

export default ScreenLayout
