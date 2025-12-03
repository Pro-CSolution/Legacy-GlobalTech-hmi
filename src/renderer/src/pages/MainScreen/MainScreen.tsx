import React, { useState, useEffect } from 'react'
import { ScreenLayout } from 'layouts'
import { TrendChart } from 'components/TrendChart'

// Local Components
import { SystemStatus } from './localComponents/SystemStatus'
import { ElectricalParams } from './localComponents/ElectricalParams'
import { SpeedControl } from './localComponents/SpeedControl'
import { DriveControl } from './localComponents/DriveControl'

// Styles
import { MainContainer } from './MainScreen.styles'

const MainScreen: React.FC = () => {
  // State
  const [speedRef, setSpeedRef] = useState(45)
  const [controlState, setControlState] = useState({
    mode: 'local',
    breaker: 'closed',
    driveRunning: false,
    driveFault: false,
    vfdCoolant: 'ok',
    blower: 'on',
    motorTempWarn: 'ok',
    motorTempHigh: 'ok'
  })

  const [electrical, setElectrical] = useState({
    volts: 480,
    amps: 124,
    hz: 60.0,
    kw: 85,
    torque: 78
  })

  // Simulation Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElectrical(() => ({
        volts: Number((478 + Math.random() * 4).toFixed(1)),
        amps: Number(((controlState.driveRunning ? 120 : 0) + Math.random() * 5).toFixed(1)),
        hz: Number((controlState.driveRunning ? (speedRef / 100) * 60 : 0).toFixed(1)),
        kw: Number((controlState.driveRunning ? (speedRef / 100) * 90 : 0).toFixed(1)),
        torque: Number((controlState.driveRunning ? 75 + Math.random() * 5 : 0).toFixed(1))
      }))
    }, 1000)
    return () => clearInterval(timer)
  }, [controlState.driveRunning, speedRef])

  return (
    <ScreenLayout>
      <MainContainer>
        {/* Left Column: System Status (Absolute Position) */}
        <SystemStatus controlState={controlState} position={{ left: 20, top: 20 }} />

        {/* Center Top: Electrical (Absolute Position) */}
        <ElectricalParams electrical={electrical} position={{ left: 420, top: 20 }} />

        {/* Center Bottom: Speed Control (Absolute Position) */}
        <SpeedControl
          speedRef={speedRef}
          setSpeedRef={setSpeedRef}
          position={{ left: 420, bottom: 97 }}
          height={380}
          width={1080}
        />

        {/* Right Column: Drive Control (Absolute Position) */}
        <DriveControl
          controlState={controlState}
          setControlState={setControlState}
          position={{ left: 1520, top: 20 }}
          height={850}
          width={350}
        />

        {/* Trend Chart Demo */}
        <TrendChart
          title="Pressure"
          demoData
          demoDataConfig={{
            baseValue: 5, // Presión típica (bar)
            noiseAmplitude: 0.8,
            minValue: 2,
            maxValue: 10
          }}
          timeWindow={5}
          variant="modern"
          position={{ left: 420, top: 310 }}
          width={350}
          height={170}
          scales={{
            y: { min: 2, max: 10 }
          }}
        />
        <TrendChart
          title="Temperature"
          demoData
          demoDataConfig={{
            baseValue: 62, // Temperatura típica (°C)
            noiseAmplitude: 17,
            minValue: 40,
            maxValue: 80
          }}
          timeWindow={5}
          variant="modern"
          position={{ left: 785, top: 310 }}
          width={350}
          height={170}
          scales={{
            y: { min: 40, max: 80 }
          }}
        />
        <TrendChart
          title="RPM"
          demoData
          demoDataConfig={{
            baseValue: 1480, // Velocidad típica de motor (rpm)
            noiseAmplitude: 60,
            minValue: 1280,
            maxValue: 1600
          }}
          timeWindow={5}
          variant="modern"
          position={{ left: 1150, top: 310 }}
          width={350}
          height={170}
          scales={{
            y: { min: 1280, max: 1600 }
          }}
        />
      </MainContainer>
    </ScreenLayout>
  )
}

export default MainScreen
