import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import { GlobalStyles } from './styles/GlobalStyles'
import { RealtimeProvider } from './contexts/RealtimeContext'
import { RouterProvider } from 'react-router/dom'
import { router } from './routes'

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <RealtimeProvider>
        <RouterProvider router={router} />
      </RealtimeProvider>
    </ThemeProvider>
  )
}

export default App
