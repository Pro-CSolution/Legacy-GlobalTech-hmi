import { FC } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import MainScreen from '../pages/MainScreen'
import TempScreen from 'pages/TempScreen'
import { TrendScreen } from 'pages/TrendScreen'

const AppRouter: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/temps" element={<TempScreen />} />
      <Route path="/trends" element={<TrendScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
