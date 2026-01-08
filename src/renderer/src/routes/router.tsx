import { Navigate, createHashRouter } from 'react-router'

import MainScreen from '../pages/MainScreen'
import TempScreen from '../pages/TempScreen'
import { TrendScreen } from '../pages/TrendScreen'
import { DriveParameters } from '../pages/DriveParameters'
import MotorProfiles from '../pages/MotorProfiles'
import { AlarmsScreen } from '../pages/AlarmsScreen'
import VfdCoolantScreen from '../pages/VfdCoolantScreen'
import ConfigScreen from '../pages/ConfigScreen'

export const router = createHashRouter([
  { path: '/', element: <MainScreen /> },
  { path: '/temps', element: <TempScreen /> },
  { path: '/alarms', element: <AlarmsScreen /> },
  { path: '/trends', element: <TrendScreen /> },
  { path: '/drive-parameters', element: <DriveParameters /> },
  { path: '/motor-profiles', element: <MotorProfiles /> },
  { path: '/vfd-coolant', element: <VfdCoolantScreen /> },
  { path: '/config', element: <ConfigScreen /> },
  { path: '*', element: <Navigate to="/" replace /> }
])
