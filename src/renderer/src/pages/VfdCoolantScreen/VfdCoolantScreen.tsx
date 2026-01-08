import { ScreenLayout } from 'layouts'
import { useTrendData, useDeviceData } from 'hooks'
import { TrendChart } from 'components/TrendChart'
import VerticalGauge from 'components/VerticalGauge'

import {
  MainGrid,
  LeftColumn,
  CenterColumn,
  RightColumn,
  ControlGroup,
  GaugesContainer,
  ChartContainer
} from './VfdCoolantScreen.styles'

import { PumpControl } from './localComponents/PumpControl'
import { SystemStatusPanel } from './localComponents/SystemStatusPanel'
import { SensorsPanel } from './localComponents/SensorsPanel'

const formatEpochSecondsToLocalTime = (seconds: number): string => {
  const date = new Date(seconds * 1000)
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const VfdCoolantScreen = () => {
  const { raw: wagoData } = useDeviceData('wago')

  // Mapeo de valores reales desde WAGO
  const pump1Running = Boolean(wagoData.Conv_Pump_Run)
  const coolantPsi = Number(wagoData.Cooling_Water_Press || 0)
  const coolantTemp = Number(wagoData.Drive_Cooling_Temp || 0)
  const flowLow = !wagoData.Drive_Coolant_Flow // Si el bit de flujo es falso, el flujo es bajo
  const leakDetected = Boolean(wagoData.Drive_Coolant_Leak)
  const coolantPressureOk = Boolean(wagoData.Drive_Coolant_Press)
  const supply480V = Boolean(wagoData.Supply_480VAC_On)
  const mainBreakerClosed = Boolean(wagoData.Main_CB_Closed_Light)

  // Use existing hook for Trend Data
  const { xDomain, getDataset } = useTrendData('wago', ['Cooling_Water_Press'], {
    windowMinutes: 5
  })

  return (
    <ScreenLayout>
      <MainGrid>
        {/* Left Control Panel */}
        <LeftColumn>
          <SystemStatusPanel
            flowLow={flowLow}
            coolantPressureOk={coolantPressureOk}
            coolantLeak={leakDetected}
            supply480V={supply480V}
            mainBreakerClosed={mainBreakerClosed}
          />

          <ControlGroup>
            <PumpControl title="COOLANT PUMP 1" isRunning={pump1Running} />
          </ControlGroup>

          <SensorsPanel
            pressureLow={coolantPsi < 20}
            tempOk={coolantTemp < 160}
            leakDetected={leakDetected}
          />
        </LeftColumn>

        {/* Center Trend Chart */}
        <CenterColumn>
          <ChartContainer>
            {/* Using absolute positioning as per component requirement, but relative to this container */}
            <TrendChart
              title="Coolant Pressure Trend (PSI)"
              datasets={getDataset('Cooling_Water_Press')}
              timeWindow={5}
              variant="modern"
              responsive={true}
              maintainAspectRatio={false}
              position={{ left: 0, top: 0 }}
              width="100%"
              height="100%"
              scales={{
                x: {
                  min: xDomain?.min,
                  max: xDomain?.max,
                  ticks: {
                    callback: (val: unknown): string =>
                      formatEpochSecondsToLocalTime(val as number),
                    stepSec: 25
                  }
                },
                y: { min: 0, max: 100 }
              }}
            />
          </ChartContainer>
        </CenterColumn>

        {/* Right Gauges */}
        <RightColumn>
          <GaugesContainer>
            <VerticalGauge
              value={coolantPsi}
              minValue={0}
              maxValue={60}
              unitOfMeasure="PSI"
              size={{ width: 100, height: 500 }}
            />

            <VerticalGauge
              value={coolantTemp}
              minValue={50}
              maxValue={200}
              unitOfMeasure="°F"
              size={{ width: 100, height: 500 }}
            />
          </GaugesContainer>
        </RightColumn>
      </MainGrid>
    </ScreenLayout>
  )
}

export default VfdCoolantScreen
