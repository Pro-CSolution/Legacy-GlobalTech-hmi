import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import { AppRouter } from './routes'
import { RealtimeProvider } from './contexts/RealtimeContext'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <RealtimeProvider>
        <AppRouter />
      </RealtimeProvider>
    </ThemeProvider>
  )
}

export default App
