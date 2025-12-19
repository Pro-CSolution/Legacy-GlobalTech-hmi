import { Routes, Route, Navigate } from 'react-router'
import MainScreen from '../pages/MainScreen'
import TempScreen from 'pages/TempScreen'
import { TrendScreen } from 'pages/TrendScreen'
import { DriveParameters } from 'pages/DriveParameters'
import MotorProfiles from 'pages/MotorProfiles'
import { AlarmsScreen } from 'pages/AlarmsScreen'
import VfdCoolantScreen from 'pages/VfdCoolantScreen'
import ConfigScreen from 'pages/ConfigScreen'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/temps" element={<TempScreen />} />
      <Route path="/alarms" element={<AlarmsScreen />} />
      <Route path="/trends" element={<TrendScreen />} />
      <Route path="/drive-parameters" element={<DriveParameters />} />
      <Route path="/motor-profiles" element={<MotorProfiles />} />
      <Route path="/vfd-coolant" element={<VfdCoolantScreen />} />
      <Route path="/config" element={<ConfigScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
