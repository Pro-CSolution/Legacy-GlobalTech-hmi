import { HMI_CONFIG } from 'config/constants'
import HMIContainer from 'components/HMIContainer'
import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import MonitorHeader from 'components/Layout/MonitorHeader'
import MonitorFooter from 'components/Layout/MonitorFooter'
import MobileMonitorNav from 'components/Layout/MobileMonitorNav/MobileMonitorNav'
import { useAccessMode } from 'hooks'
import { useIsViewportBelow } from 'hooks/useViewportWidth'
import { ContentContainer, LayoutWrapper } from './ScreenLayout.styles'

interface ScreenLayoutProps {
  children: React.ReactNode
}

const ScreenLayout = ({ children }: ScreenLayoutProps) => {
  const { isViewOnly } = useAccessMode()
  const isMobileViewOnly = isViewOnly && useIsViewportBelow(768)

  return (
    <HMIContainer
      baseWidth={HMI_CONFIG.SCREEN.BASE_WIDTH}
      baseHeight={HMI_CONFIG.SCREEN.BASE_HEIGHT}
      responsiveOnSmallScreens={isViewOnly}
    >
      <LayoutWrapper>
        {isViewOnly ? <MonitorHeader /> : <Header />}
        <ContentContainer $mobileViewOnly={isMobileViewOnly}>{children}</ContentContainer>
        {isViewOnly ? isMobileViewOnly ? <MobileMonitorNav /> : <MonitorFooter /> : <Footer />}
      </LayoutWrapper>
    </HMIContainer>
  )
}

export default ScreenLayout
