import React, { useState, useEffect } from 'react'
import { ScreenLayout } from 'layouts'
import { useTrendData } from 'hooks'
import { PARAMETER_ALIASES } from 'types/generated/devices'
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

const VfdCoolantScreen = () => {
  // Mock State for UI Demo
  const [pump1Running, setPump1Running] = useState(false)
  const [pump2Running, setPump2Running] = useState(true)
  const [systemFault, setSystemFault] = useState(false)
  const [flowLow, setFlowLow] = useState(false)

  // Simulated Analog Values
  const [coolantPsi, setCoolantPsi] = useState(45)
  const [coolantTemp, setCoolantTemp] = useState(135)
  const [leakDetected, setLeakDetected] = useState(false)

  // Use existing hook for Trend Data (using placeholder aliases for demo)
  // In a real scenario, these would be the actual coolant pressure/temp aliases
  const { xDomain, getDataset } = useTrendData('drive_avid', ['torqueDemand', 'dcLinkVoltage'], {
    windowMinutes: 5
  })

  // Simulate changing values
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate values slightly
      setCoolantPsi((prev) => Math.max(0, Math.min(60, prev + (Math.random() - 0.5) * 2)))
      setCoolantTemp((prev) => Math.max(100, Math.min(200, prev + (Math.random() - 0.5) * 3)))

      // Randomly toggle fault states rarely
      if (Math.random() > 0.995) setFlowLow((prev) => !prev)
      if (Math.random() > 0.998) setLeakDetected((prev) => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ScreenLayout title="VFD COOLANT SYSTEM">
      <MainGrid>
        {/* Left Control Panel */}
        <LeftColumn>
          <SystemStatusPanel systemFault={systemFault} flowLow={flowLow} />

          <ControlGroup>
            <PumpControl
              title="COOLANT PUMP 1"
              isRunning={pump1Running}
              onStart={() => setPump1Running(true)}
              onStop={() => setPump1Running(false)}
            />

            <PumpControl
              title="COOLANT PUMP 2"
              isRunning={pump2Running}
              onStart={() => setPump2Running(true)}
              onStop={() => setPump2Running(false)}
            />
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
              datasets={getDataset(PARAMETER_ALIASES.torqueDemand)} // Using torque as mock for pressure
              timeWindow={5}
              variant="modern"
              position={{ left: 20, top: 20 }}
              width={1000} // Approximate width to fill container
              height={700}
              scales={{
                x: { min: xDomain?.min, max: xDomain?.max },
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
              endLL={10}
              endL={20}
              startH={50}
              startHH={55}
              size={{ width: 120, height: 750 }}
            />

            <VerticalGauge
              value={coolantTemp}
              minValue={50}
              maxValue={200}
              unitOfMeasure="°F"
              startH={160}
              startHH={180}
              size={{ width: 120, height: 750 }}
            />
          </GaugesContainer>
        </RightColumn>
      </MainGrid>
    </ScreenLayout>
  )
}

export default VfdCoolantScreen
