import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MonitorApp from './monitor/MonitorApp'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <MonitorApp />
  </StrictMode>
)
