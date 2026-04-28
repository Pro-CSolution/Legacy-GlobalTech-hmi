import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import { AccessModeProvider } from './contexts/AccessModeContext'
import { RealtimeProvider } from './contexts/RealtimeContext'
import { TopBannerNoticeProvider } from './contexts/TopBannerNoticeContext'
import { TrendRecordingProvider } from './contexts/TrendRecordingContext'
import { RouterProvider } from 'react-router/dom'
import { router } from './routes'
import { useMultiTouchGuard, useTemperatureAlarmMonitor } from './hooks'

const AppContent = () => {
  useTemperatureAlarmMonitor()
  useMultiTouchGuard()

  return <RouterProvider router={router} />
}

const App = () => {
  return (
    <AccessModeProvider mode="operator">
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <RealtimeProvider>
          <TrendRecordingProvider>
            <TopBannerNoticeProvider>
              <AppContent />
            </TopBannerNoticeProvider>
          </TrendRecordingProvider>
        </RealtimeProvider>
      </ThemeProvider>
    </AccessModeProvider>
  )
}

export default App
