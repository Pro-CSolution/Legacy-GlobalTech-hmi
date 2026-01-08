import { ScreenLayout } from '../../layouts'
import { MainContainer, PageTitle } from './TempScreen.styles'
import { TemperaturePanel } from './localComponents/TemperaturePanel'
import { Thermometer, Activity, Droplets } from 'lucide-react'
import { useDeviceData } from '../../hooks/useDeviceData'

const TempScreen = () => {
  const { raw: wagoData } = useDeviceData('wago')

  const windingData = [
    { label: 'Winding A1', value: Number(wagoData['Temp_Winding_A1'] ?? 0) },
    { label: 'Winding B1', value: Number(wagoData['Temp_Winding_B1'] ?? 0) },
    { label: 'Winding C1', value: Number(wagoData['Temp_Winding_C1'] ?? 0) }
  ]

  const bearingData = [
    { label: 'ODE Bearing', value: Number(wagoData['Temp_Bearing_NDE'] ?? 0) },
    { label: 'DE Bearing', value: Number(wagoData['Temp_Bearing_DE'] ?? 0) }
  ]

  const coolantData = [{ label: 'Internal', value: Number(wagoData['Drive_Cooling_Temp'] ?? 0) }]

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
          height={740}
          position={{ top: 100, left: 50 }}
        />

        {/* Motor Bearings Panel */}
        <TemperaturePanel
          title="Motor Bearings"
          icon={Activity}
          data={bearingData}
          columns={1}
          width={350}
          height={740}
          position={{ top: 100, left: 1080 }}
        />

        {/* VFD Coolant Panel */}
        <TemperaturePanel
          title="VFD Coolant"
          icon={Droplets}
          data={coolantData}
          columns={1}
          width={400} // Reduced width since it's single item
          height={400}
          position={{ top: 100, left: 1460 }}
        />
      </MainContainer>
    </ScreenLayout>
  )
}

export default TempScreen
