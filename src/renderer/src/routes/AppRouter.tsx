import { Routes, Route, Navigate } from 'react-router'
import MainScreen from '../pages/MainScreen'
import { TrendScreen } from 'pages/TrendScreen'
import { DriveParameters } from 'pages/DriveParameters'
import MotorProfiles from 'pages/MotorProfiles'
import { AlarmsScreen } from 'pages/AlarmsScreen'
import ConfigScreen from 'pages/ConfigScreen'
import { TemperaturesScreen } from 'pages/TemperaturesScreen'
import CoolingSystemScreen from 'pages/CoolingSystemScreen'

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/alarms" element={<AlarmsScreen />} />
      <Route path="/trends" element={<TrendScreen />} />
      <Route path="/temperatures" element={<TemperaturesScreen />} />
      <Route path="/cooling-system" element={<CoolingSystemScreen />} />
      <Route path="/drive-parameters" element={<DriveParameters />} />
      <Route path="/motor-profiles" element={<MotorProfiles />} />
      <Route path="/config" element={<ConfigScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
