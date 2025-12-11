import { FC } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import MainScreen from '../pages/MainScreen'
import TempScreen from 'pages/TempScreen'
import { TrendScreen } from 'pages/TrendScreen'
import { DriveParameters } from 'pages/DriveParameters'
import MotorProfiles from 'pages/MotorProfiles'

const AppRouter: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/temps" element={<TempScreen />} />
      <Route path="/trends" element={<TrendScreen />} />
      <Route path="/drive-parameters" element={<DriveParameters />} />
      <Route path="/motor-profiles" element={<MotorProfiles />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
