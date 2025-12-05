import React, { useEffect, useMemo, useState } from 'react'
import { ScreenLayout } from 'layouts'
import { TrendChart } from 'components/TrendChart'
import { useDeviceData, useSendCommand } from 'hooks'
import { DeviceId } from 'types'

// Local Components
import { SystemStatus } from './localComponents/SystemStatus'
import { ElectricalParams } from './localComponents/ElectricalParams'
import { SpeedControl } from './localComponents/SpeedControl'
import { DriveControl } from './localComponents/DriveControl'

// Styles
import { MainContainer } from './MainScreen.styles'

const MainScreen: React.FC = () => {
  const deviceId: DeviceId = 'drive_avid'
  const { data } = useDeviceData(deviceId)
  const { writeParameter } = useSendCommand()

  const [speedRef, setSpeedRef] = useState<number>(0)

  // Sincroniza speedRef local con el valor en vivo
  useEffect(() => {
    console.log('data', data)
    const live = data.speedReference?.value
    if (live !== undefined && live !== null) {
      const num = Number(live)
      if (!Number.isNaN(num)) setSpeedRef(num)
    }
  }, [data])

  const electrical = useMemo(() => {
    const toNum = (val: unknown) => {
      const n = Number(val)
      return Number.isFinite(n) ? n : 0
    }
    return {
      volts: toNum(data.motorVolts?.value),
      hz: toNum(data.frequencyFeedback?.value),
      kw: toNum(data.motorPower?.value),
      amps: toNum(data.motorCurrent?.value),
      torque: toNum(data.torqueDemand?.value)
    }
  }, [data])

  const driveRunning = electrical.hz > 0.1 || electrical.torque > 0.1 || electrical.amps > 0.1

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

  useEffect(() => {
    setControlState((prev) => ({
      ...prev,
      driveRunning
    }))
  }, [driveRunning])

  const handleSetSpeedRef = async (value: number) => {
    setSpeedRef(value)
    await writeParameter({
      deviceId,
      parameterId: data.speedReference?.id,
      value
    })
  }

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
          setSpeedRef={handleSetSpeedRef}
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
