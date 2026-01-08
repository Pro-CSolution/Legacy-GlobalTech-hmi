import { useEffect, useMemo, useState } from 'react'
import { ScreenLayout } from 'layouts'
import { TrendChart } from 'components/TrendChart'
import { useDeviceData, useSendCommand, useTrendData } from 'hooks'
import { DeviceId } from 'types'
import { ParameterAlias, PARAMETER_ALIASES } from 'types/generated/devices'
import type { Dataset } from 'components/TrendChart'

// Local Components
import { SystemStatus } from './localComponents/SystemStatus/SystemStatus'
import { ElectricalParams } from './localComponents/ElectricalParams'
import { SpeedControl } from './localComponents/SpeedControl'
import { DriveControl } from './localComponents/DriveControl'
import { ClientMotorInfo } from './localComponents/ClientMotorInfo'

// Styles
import { MainContainer } from './MainScreen.styles'

const TREND_ALIASES: ParameterAlias[] = ['torqueDemand', 'dcLinkVoltage', 'speedFeedback']
const MINI_TREND_WINDOW_MINUTES = 5
const MINI_TREND_WINDOW_SECONDS = MINI_TREND_WINDOW_MINUTES * 60
const MINI_TREND_TICK_STEP_SECONDS = 60

const MainScreen = () => {
  const driveId: DeviceId = 'drive_avid'

  const { data: driveData, raw: driveRaw } = useDeviceData(driveId)

  const { writeParameter } = useSendCommand()
  const { xDomain: trendXDomain, getDataset: getTrendDataset } = useTrendData(
    driveId,
    TREND_ALIASES,
    {
      windowMinutes: MINI_TREND_WINDOW_MINUTES
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

  /**
   * Mini trends: queremos que los ticks NO "caminen" con el reloj.
   * Para eso renderizamos el eje X en una escala RELATIVA [0..windowSec] y desplazamos los puntos
   * restando el `trendXDomain.min` actual.
   */
  const miniTrendXOffset = trendXDomain?.min
  const toRelativeDatasets = useMemo(() => {
    if (typeof miniTrendXOffset !== 'number' || !Number.isFinite(miniTrendXOffset)) return null
    return (datasets: Dataset[]): Dataset[] =>
      datasets.map((ds) => ({
        ...ds,
        data: ds.data.map((p) => ({ ...p, x: p.x - miniTrendXOffset }))
      }))
  }, [miniTrendXOffset])

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
      parameterId: 'P21.01',
      value
    })
  }

  return (
    <ScreenLayout>
      <MainContainer>
        {/* Left Column: System Status (Absolute Position) */}
        <SystemStatus controlState={controlState} height={480} position={{ left: 20, top: 0 }} />
        <ClientMotorInfo position={{ left: 20, top: 490 }} width={380} height={360} />

        {/* Right Column: Drive Control (Absolute Position) */}
        <DriveControl
          controlState={controlState}
          setControlState={setControlState}
          position={{ left: 1520, top: 0 }}
          height={850}
          width={350}
        />

        {/* Center Top: Electrical (Absolute Position) */}
        <ElectricalParams
          deviceId={driveId}
          deviceSnapshot={driveRaw}
          position={{ left: 420, top: 0 }}
          height={460}
        />

        {/* Center Bottom: Speed Control (Absolute Position) */}
        <SpeedControl
          speedRef={speedRef}
          setSpeedRef={handleSetSpeedRef}
          speedReferenceSourceValue={driveData.speedReferenceSource?.value}
          position={{ left: 420, bottom: 1 }}
          height={185}
          width={1080}
        />
        {/* Trend Chart Demo */}
        <TrendChart
          title="Pressure"
          datasets={
            toRelativeDatasets
              ? toRelativeDatasets(getTrendDataset(PARAMETER_ALIASES.torqueDemand))
              : getTrendDataset(PARAMETER_ALIASES.torqueDemand)
          }
          timeWindow={MINI_TREND_WINDOW_MINUTES}
          variant="modern"
          position={{ left: 420, top: 470 }}
          width={350}
          height={180}
          scales={{
            x: {
              min: 0,
              max: MINI_TREND_WINDOW_SECONDS,
              ticks: { stepSec: MINI_TREND_TICK_STEP_SECONDS }
            },
            y: {
              ticks: { space: 20 }
            }
          }}
        />

        <TrendChart
          title="Dc Link Voltage"
          datasets={
            toRelativeDatasets
              ? toRelativeDatasets(getTrendDataset(PARAMETER_ALIASES.dcLinkVoltage))
              : getTrendDataset(PARAMETER_ALIASES.dcLinkVoltage)
          }
          timeWindow={MINI_TREND_WINDOW_MINUTES}
          variant="modern"
          position={{ left: 785, top: 470 }}
          width={350}
          height={180}
          scales={{
            x: {
              min: 0,
              max: MINI_TREND_WINDOW_SECONDS,
              ticks: { stepSec: MINI_TREND_TICK_STEP_SECONDS }
            },
            y: {
              ticks: { space: 20 }
            }
          }}
        />
        <TrendChart
          title="RPM"
          datasets={
            toRelativeDatasets
              ? toRelativeDatasets(getTrendDataset(PARAMETER_ALIASES.speedFeedback))
              : getTrendDataset(PARAMETER_ALIASES.speedFeedback)
          }
          timeWindow={MINI_TREND_WINDOW_MINUTES}
          variant="modern"
          position={{ left: 1150, top: 470 }}
          width={350}
          height={180}
          scales={{
            x: {
              min: 0,
              max: MINI_TREND_WINDOW_SECONDS,
              ticks: { stepSec: MINI_TREND_TICK_STEP_SECONDS }
            },
            y: {
              ticks: { space: 20 }
            }
          }}
        />
      </MainContainer>
    </ScreenLayout>
  )
}

export default MainScreen
