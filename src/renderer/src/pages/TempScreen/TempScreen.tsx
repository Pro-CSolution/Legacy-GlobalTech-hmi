import { ScreenLayout } from '../../layouts'
import { MainContainer, PageTitle } from './TempScreen.styles'
import { TemperaturePanel } from './localComponents/TemperaturePanel'
import { Thermometer, Activity, Droplets } from 'lucide-react'

const TempScreen = () => {
  // Realistic temperature values for industrial motors and cooling systems
  const generateRealisticTemp = (baseTemp: number, variance: number = 15): number => {
    return Math.round(baseTemp + (Math.random() - 0.5) * variance * 2)
  }

  const values = {
    // Motor winding temperatures (normal operating range: 80-140°F)
    motorA1: generateRealisticTemp(115),
    motorA2: generateRealisticTemp(118),
    motorB1: generateRealisticTemp(10), // Note: This seems low in original code, kept as is
    motorB2: generateRealisticTemp(120),
    motorC1: generateRealisticTemp(116),
    motorC2: generateRealisticTemp(155),

    // Bearing temperatures (slightly higher than windings: 90-150°F)
    motorOde: generateRealisticTemp(135), // ODE = Outboard Drive End
    motorDe: generateRealisticTemp(132), // DE = Drive End

    // VFD coolant temperature (cooling system: 60-120°F)
    vfdCoolant: generateRealisticTemp(85)
  }

  const windingData = [
    { label: 'Winding A1', value: values.motorA1 },
    { label: 'Winding B1', value: values.motorB1 },
    { label: 'Winding C1', value: values.motorC1 },
    { label: 'Winding A2', value: values.motorA2 },
    { label: 'Winding B2', value: values.motorB2 },
    { label: 'Winding C2', value: values.motorC2 }
  ]

  const bearingData = [
    { label: 'ODE Bearing', value: values.motorOde },
    { label: 'DE Bearing', value: values.motorDe }
  ]

  const coolantData = [
    { label: 'Internal', value: values.vfdCoolant, startH: 140, startHH: 160, endLL: 30, endL: 40 }
  ]

  return (
    <ScreenLayout>
      <MainContainer>
        <PageTitle>TEST STAND A</PageTitle>

        {/* Motor Windings Panel */}
        <TemperaturePanel
          title="Motor Windings"
          icon={Thermometer}
          data={windingData}
          columns={3}
          width={1000}
          height={720}
          position={{ top: 120, left: 50 }}
        />

        {/* Motor Bearings Panel */}
        <TemperaturePanel
          title="Motor Bearings"
          icon={Activity}
          data={bearingData}
          columns={2}
          width={700}
          height={320}
          position={{ top: 120, left: 1080 }}
        />

        {/* VFD Coolant Panel */}
        <TemperaturePanel
          title="VFD Coolant"
          icon={Droplets}
          data={coolantData}
          columns={1}
          width={400} // Reduced width since it's single item
          height={320}
          position={{ top: 460, left: 1080 }}
        />
      </MainContainer>
    </ScreenLayout>
  )
}

export default TempScreen
