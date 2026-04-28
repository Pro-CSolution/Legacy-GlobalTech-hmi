import { Navigate, createHashRouter } from 'react-router'

import MainScreen from '../pages/MainScreen'
import { TrendScreen } from '../pages/TrendScreen'
import { DriveParameters } from '../pages/DriveParameters'
import MotorProfiles from '../pages/MotorProfiles'
import { AlarmsScreen } from '../pages/AlarmsScreen'
import ConfigScreen from '../pages/ConfigScreen'
import { TemperaturesScreen } from '../pages/TemperaturesScreen'
import CoolingSystemScreen from '../pages/CoolingSystemScreen'

export const router = createHashRouter([
  { path: '/', element: <MainScreen /> },
  { path: '/alarms', element: <AlarmsScreen /> },
  { path: '/trends', element: <TrendScreen /> },
  { path: '/temperatures', element: <TemperaturesScreen /> },
  { path: '/cooling-system', element: <CoolingSystemScreen /> },
  { path: '/wago-live', element: <Navigate to="/config?section=wago" replace /> },
  { path: '/drive-parameters', element: <DriveParameters /> },
  { path: '/motor-profiles', element: <MotorProfiles /> },
  { path: '/config', element: <ConfigScreen /> },
  { path: '*', element: <Navigate to="/" replace /> }
])
