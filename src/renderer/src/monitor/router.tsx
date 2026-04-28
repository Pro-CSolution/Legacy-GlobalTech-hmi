import { Navigate, createBrowserRouter } from 'react-router'
import MainScreen from '../pages/MainScreen'
import { TemperaturesScreen } from '../pages/TemperaturesScreen'
import CoolingSystemScreen from '../pages/CoolingSystemScreen'
import { DriveParameters } from '../pages/DriveParameters'
import TrendScreen from '../pages/TrendScreen/TrendScreen'
import { AlarmsScreen } from '../pages/AlarmsScreen'

export const monitorRouter = createBrowserRouter([
  { path: '/', element: <MainScreen /> },
  { path: '/temperatures', element: <TemperaturesScreen /> },
  { path: '/cooling-system', element: <CoolingSystemScreen /> },
  { path: '/drive-parameters', element: <DriveParameters /> },
  { path: '/trends', element: <TrendScreen /> },
  { path: '/alarms', element: <AlarmsScreen /> },
  { path: '*', element: <Navigate to="/" replace /> }
])
