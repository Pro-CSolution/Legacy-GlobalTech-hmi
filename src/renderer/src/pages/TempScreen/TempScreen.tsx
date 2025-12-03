import { ScreenLayout } from '../../layouts'
import { FC } from 'react'
import { MainContainer, PageTitle, GaugeWrapper, GaugeLabel } from './TempScreen.styles'
import VerticalGauge from '../../components/VerticalGauge'

const TempScreen: FC = () => {
  // Realistic temperature values for industrial motors and cooling systems
  const generateRealisticTemp = (baseTemp: number, variance: number = 15): number => {
    return Math.round(baseTemp + (Math.random() - 0.5) * variance * 2)
  }

  const values = {
    // Motor winding temperatures (normal operating range: 80-140°F)
    motorA1: generateRealisticTemp(115),
    motorA2: generateRealisticTemp(118),
    motorB1: generateRealisticTemp(10),
    motorB2: generateRealisticTemp(120),
    motorC1: generateRealisticTemp(116),
    motorC2: generateRealisticTemp(155),

    // Bearing temperatures (slightly higher than windings: 90-150°F)
    motorOde: generateRealisticTemp(135), // ODE = Outboard Drive End
    motorDe: generateRealisticTemp(132), // DE = Drive End

    // VFD coolant temperature (cooling system: 60-120°F)
    vfdCoolant: generateRealisticTemp(85)
  }

  return (
    <ScreenLayout>
      <MainContainer>
        <PageTitle>TEST STAND A</PageTitle>

        {/* --- COLUMN 1 --- */}

        {/* MOTOR WINDING A1 */}
        <GaugeWrapper left={100} top={150}>
          <GaugeLabel>MOTOR WINDING A1</GaugeLabel>
          <VerticalGauge
            value={values.motorA1}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* MOTOR WINDING A2 */}
        <GaugeWrapper left={100} top={550}>
          <GaugeLabel>MOTOR WINDING A2</GaugeLabel>
          <VerticalGauge
            value={values.motorA2}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* VFD COOLANT INTERNAL */}
        <GaugeWrapper left={1100} top={150}>
          <GaugeLabel>VFD COOLANT INTERNAL</GaugeLabel>
          <VerticalGauge
            value={values.vfdCoolant}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={30}
            endL={40}
            startH={140}
            startHH={160}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* --- COLUMN 2 --- */}

        {/* MOTOR WINDING B1 */}
        <GaugeWrapper left={350} top={150}>
          <GaugeLabel>MOTOR WINDING B1</GaugeLabel>
          <VerticalGauge
            value={values.motorB1}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* MOTOR WINDING B2 */}
        <GaugeWrapper left={350} top={550}>
          <GaugeLabel>MOTOR WINDING B2</GaugeLabel>
          <VerticalGauge
            value={values.motorB2}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* --- COLUMN 3 --- */}

        {/* MOTOR WINDING C1 */}
        <GaugeWrapper left={600} top={150}>
          <GaugeLabel>MOTOR WINDING C1</GaugeLabel>
          <VerticalGauge
            value={values.motorC1}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* MOTOR WINDING C2 */}
        <GaugeWrapper left={600} top={550}>
          <GaugeLabel>MOTOR WINDING C2</GaugeLabel>
          <VerticalGauge
            value={values.motorC2}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* --- COLUMN 4 --- */}

        {/* MOTOR ODE BEARING */}
        <GaugeWrapper left={850} top={150}>
          <GaugeLabel>MOTOR ODE BEARING</GaugeLabel>
          <VerticalGauge
            value={values.motorOde}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>

        {/* MOTOR DE BEARING */}
        <GaugeWrapper left={850} top={550}>
          <GaugeLabel>MOTOR DE BEARING</GaugeLabel>
          <VerticalGauge
            value={values.motorDe}
            minValue={0}
            maxValue={200}
            unitOfMeasure="DEG F"
            endLL={20}
            endL={50}
            startH={160}
            startHH={180}
            size={{ width: 120, height: 300 }}
          />
        </GaugeWrapper>
      </MainContainer>
    </ScreenLayout>
  )
}

export default TempScreen
