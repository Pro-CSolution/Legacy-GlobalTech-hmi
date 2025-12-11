import React, { useEffect, useMemo, useState } from 'react'
import { ScreenLayout } from 'layouts'
import { TrendChart } from 'components/TrendChart'
import { useDeviceData, useSendCommand, useTrendData } from 'hooks'
import { DeviceId } from 'types'
import { ParameterAlias, PARAMETER_ALIASES } from 'types/generated/devices'

// Local Components
import { SystemStatus } from './localComponents/SystemStatus'
import { ElectricalParams } from './localComponents/ElectricalParams'
import { SpeedControl } from './localComponents/SpeedControl'
import { DriveControl } from './localComponents/DriveControl'
import { ClientMotorInfo } from './localComponents/ClientMotorInfo'

// Styles
import { MainContainer } from './MainScreen.styles'

const TREND_ALIASES: ParameterAlias[] = ['torqueDemand', 'dcLinkVoltage', 'speedFeedback']

const MainScreen: React.FC = () => {
  const driveId: DeviceId = 'drive_avid'

  const { data: driveData } = useDeviceData(driveId)

  const { writeParameter } = useSendCommand()
  const { xDomain: trendXDomain, getDataset: getTrendDataset } = useTrendData(
    driveId,
    TREND_ALIASES,
    {
      windowMinutes: 5
    }
  )
  const [speedRef, setSpeedRef] = useState<number>(0)

  // Sincroniza speedRef local con el valor en vivo
  useEffect(() => {
    const live = driveData.speedReference?.value
    if (live !== undefined && live !== null) {
      const num = Number(live)
      if (!Number.isNaN(num)) setSpeedRef(num)
    }
  }, [driveData])

  const electrical = useMemo(() => {
    const toNum = (val: unknown) => {
      const n = Number(val)
      return Number.isFinite(n) ? n : 0
    }
    return {
      volts: toNum(driveData.motorVolts?.value),
      hz: toNum(driveData.frequencyFeedback?.value),
      kw: toNum(driveData.motorPower?.value),
      amps: toNum(driveData.motorCurrent?.value),
      torque: toNum(driveData.torqueDemand?.value)
    }
  }, [driveData])

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
      deviceId: driveId,
      parameterId: driveData.speedReference?.id,
      value
    })
  }

  return (
    <ScreenLayout>
      <MainContainer>
        {/* Left Column: System Status (Absolute Position) */}
        <SystemStatus controlState={controlState} height={582} position={{ left: 20, top: 20 }} />
        <ClientMotorInfo position={{ left: 20, top: 610 }} width={380} height={360} />

        {/* Center Top: Electrical (Absolute Position) */}
        <ElectricalParams electrical={electrical} position={{ left: 420, top: 20 }} />

        {/* Center Bottom: Speed Control (Absolute Position) */}
        <SpeedControl
          speedRef={speedRef}
          setSpeedRef={handleSetSpeedRef}
          position={{ left: 420, bottom: 0.1 }}
          height={280}
          width={1080}
        />

        {/* Right Column: Drive Control (Absolute Position) */}
        <DriveControl
          controlState={controlState}
          setControlState={setControlState}
          position={{ left: 1520, top: 20 }}
          height={950}
          width={350}
        />

        {/* Trend Chart Demo */}
        <TrendChart
          title="Pressure"
          datasets={getTrendDataset(PARAMETER_ALIASES.torqueDemand)}
          timeWindow={5}
          variant="modern"
          position={{ left: 420, top: 500 }}
          width={350}
          height={170}
          scales={{
            x: {
              min: trendXDomain?.min,
              max: trendXDomain?.max
            }
          }}
        />
        <TrendChart
          title="Dc Link Voltage"
          datasets={getTrendDataset(PARAMETER_ALIASES.dcLinkVoltage)}
          timeWindow={5}
          variant="modern"
          position={{ left: 785, top: 500 }}
          width={350}
          height={170}
          scales={{
            x: {
              min: trendXDomain?.min,
              max: trendXDomain?.max
            }
          }}
        />
        <TrendChart
          title="RPM"
          datasets={getTrendDataset(PARAMETER_ALIASES.speedFeedback)}
          timeWindow={5}
          variant="modern"
          position={{ left: 1150, top: 500 }}
          width={350}
          height={170}
          scales={{
            x: {
              min: trendXDomain?.min,
              max: trendXDomain?.max
            }
          }}
        />
      </MainContainer>
    </ScreenLayout>
  )
}

export default MainScreen
