import { ThemeProvider } from 'styled-components'
import { RouterProvider } from 'react-router/dom'
import { theme } from '../styles/theme'
import { GlobalStyles } from '../styles/GlobalStyles'
import { AccessModeProvider } from '../contexts/AccessModeContext'
import { RealtimeProvider } from '../contexts/RealtimeContext'
import { TopBannerNoticeProvider } from '../contexts/TopBannerNoticeContext'
import { useMultiTouchGuard, useTemperatureAlarmMonitor } from '../hooks'
import { monitorRouter } from './router'

const MonitorAppContent = () => {
  useTemperatureAlarmMonitor()
  useMultiTouchGuard()

  return <RouterProvider router={monitorRouter} />
}

const MonitorApp = () => {
  return (
    <AccessModeProvider mode="view-only">
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <RealtimeProvider>
          <TopBannerNoticeProvider>
            <MonitorAppContent />
          </TopBannerNoticeProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </AccessModeProvider>
  )
}

export default MonitorApp
