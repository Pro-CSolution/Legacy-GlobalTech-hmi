import { useEffect, useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Cpu, ListTree, Fan, Thermometer, Waves, X } from 'lucide-react'
import Card from 'components/Card'
import { ModalBase } from 'components/Modal'
import Panel from 'components/Panel'
import {
  getTemperatureUnitLabel,
  toDisplayTemperature,
  useAccessMode,
  useDeviceData,
  useIsViewportBelow,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  useTemperatureUnitPreference,
  useWagoDisplayNameOverrides,
  type TemperatureUnit
} from 'hooks'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { ScreenLayout } from 'layouts'
import { fetchWagoLiveSnapshot } from 'services'
import type { ParameterId } from 'types'
import {
  getMotorDriveDeviceId,
  getMotorWagoDeviceId,
  type MotorDeviceRole,
  type MotorScope
} from 'utils/motorDeviceMapping'
import {
  getMotorTemperatureAlertSeverity,
  IGBT_CRITICAL_C,
  IGBT_WARNING_C,
  MOTOR_BEARING_CRITICAL_F,
  MOTOR_BEARING_WARNING_F,
  MOTOR_WINDING_CRITICAL_F,
  MOTOR_WINDING_WARNING_F,
  shouldAnimateMotorTemperatureAlert,
  type TemperatureAlertSeverity
} from 'utils/temperatureAlerts'
import {
  formatWagoTemperatureSpareSignalLabel,
  getWagoTemperatureSpareDisplayName,
  toWagoTemperatureSpareFahrenheit,
  WAGO_TEMPERATURE_SPARE_ROWS
} from '../WagoLiveScreen/wagoTemperatureSpares'
import * as S from './TemperaturesScreen.styles'

type MetricKind = 'temperature-celsius' | 'temperature-fahrenheit' | 'pressure'

type TemperatureMetric = {
  id: string
  deviceRole: MotorDeviceRole
  parameterId: ParameterId
  modbusRegister?: number
  label: string
  description: string
  kind: MetricKind
  min: number
  max: number
  startH?: number
  startHH?: number
  endL?: number
  endLL?: number
  unitLabel?: string
}

type TemperatureCategory = {
  key: 'bearings' | 'windings' | 'cooling' | 'igbt'
  title: string
  description: string
  accent: string
  icon: LucideIcon
  metrics: TemperatureMetric[]
}

const COOLANT_WARN_F = 140
const COOLANT_HIGH_HIGH_F = 167

const TEMPERATURE_CATEGORIES: TemperatureCategory[] = [
  {
    key: 'bearings',
    title: 'Motor Bearings',
    description: 'Live DEGF readings for the primary bearing channels.',
    accent: '#22c55e',
    icon: Thermometer,
    metrics: [
      {
        id: 'bearing-de',
        deviceRole: 'wago',
        parameterId: 'Motor_Bearing_DE_DEGF',
        modbusRegister: 400016,
        label: 'DE',
        description: 'Main drive-end bearing temperature.',
        kind: 'temperature-fahrenheit',
        min: 40,
        max: 220,
        startH: MOTOR_BEARING_WARNING_F,
        startHH: MOTOR_BEARING_CRITICAL_F
      },
      {
        id: 'bearing-nde',
        deviceRole: 'wago',
        parameterId: 'Motor_Bearing_NDE_DEGF',
        modbusRegister: 400017,
        label: 'NDE',
        description: 'Main non-drive-end bearing temperature.',
        kind: 'temperature-fahrenheit',
        min: 40,
        max: 220,
        startH: MOTOR_BEARING_WARNING_F,
        startHH: MOTOR_BEARING_CRITICAL_F
      }
    ]
  },
  {
    key: 'windings',
    title: 'Motor Winding Temps',
    description: 'All primary winding DEGF channels in one view.',
    accent: '#7adfff',
    icon: Waves,
    metrics: [
      {
        id: 'winding-a1',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_A1_DEGF',
        modbusRegister: 400010,
        label: 'A1',
        description: 'Primary winding A1 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      },
      {
        id: 'winding-b1',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_B1_DEGF',
        modbusRegister: 400011,
        label: 'B1',
        description: 'Primary winding B1 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      },
      {
        id: 'winding-c1',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_C1_DEGF',
        modbusRegister: 400012,
        label: 'C1',
        description: 'Primary winding C1 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      },
      {
        id: 'winding-a2',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_A2_DEGF',
        modbusRegister: 400013,
        label: 'A2',
        description: 'Primary winding A2 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      },
      {
        id: 'winding-b2',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_B2_DEGF',
        modbusRegister: 400014,
        label: 'B2',
        description: 'Primary winding B2 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      },
      {
        id: 'winding-c2',
        deviceRole: 'wago',
        parameterId: 'Motor_Winding_C2_DEGF',
        modbusRegister: 400015,
        label: 'C2',
        description: 'Primary winding C2 temperature.',
        kind: 'temperature-fahrenheit',
        min: 60,
        max: 400,
        startH: MOTOR_WINDING_WARNING_F,
        startHH: MOTOR_WINDING_CRITICAL_F
      }
    ]
  },
  {
    key: 'cooling',
    title: 'Cooling Readouts',
    description: 'Direct coolant temperature value from the WAGO PLC.',
    accent: '#06b6d4',
    icon: Fan,
    metrics: [
      {
        id: 'coolant-temp',
        deviceRole: 'wago',
        parameterId: 'Coolant_Temp_DEGF',
        modbusRegister: 400026,
        label: 'Coolant Temp',
        description: 'Cooling loop temperature in degrees Fahrenheit.',
        kind: 'temperature-fahrenheit',
        min: 32,
        max: 200,
        startH: COOLANT_WARN_F,
        startHH: COOLANT_HIGH_HIGH_F
      },
      {
        id: 'coolant-pressure',
        deviceRole: 'wago',
        parameterId: 'Coolant_Pressure_PSI',
        modbusRegister: 400027,
        label: 'Coolant Pressure',
        description: 'Cooling loop pressure in PSI.',
        kind: 'pressure',
        min: 0,
        max: 100,
        unitLabel: 'PSI'
      }
    ]
  },
  {
    key: 'igbt',
    title: 'IGBT Temps',
    description: 'All inverter module temperatures with high-temp highlighting.',
    accent: '#4fb5ff',
    icon: Cpu,
    metrics: [
      {
        id: 'igbt-u1',
        deviceRole: 'drive',
        parameterId: 'P45.00',
        label: 'IGBT U1',
        description: 'IGBT U1 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-v1',
        deviceRole: 'drive',
        parameterId: 'P45.01',
        label: 'IGBT V1',
        description: 'IGBT V1 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-w1',
        deviceRole: 'drive',
        parameterId: 'P45.02',
        label: 'IGBT W1',
        description: 'IGBT W1 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-u2',
        deviceRole: 'drive',
        parameterId: 'P45.07',
        label: 'IGBT U2',
        description: 'IGBT U2 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-v2',
        deviceRole: 'drive',
        parameterId: 'P45.08',
        label: 'IGBT V2',
        description: 'IGBT V2 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-w2',
        deviceRole: 'drive',
        parameterId: 'P45.09',
        label: 'IGBT W2',
        description: 'IGBT W2 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-u3',
        deviceRole: 'drive',
        parameterId: 'P45.10',
        label: 'IGBT U3',
        description: 'IGBT U3 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-v3',
        deviceRole: 'drive',
        parameterId: 'P45.11',
        label: 'IGBT V3',
        description: 'IGBT V3 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      },
      {
        id: 'igbt-w3',
        deviceRole: 'drive',
        parameterId: 'P45.12',
        label: 'IGBT W3',
        description: 'IGBT W3 temperature.',
        kind: 'temperature-celsius',
        min: -40,
        max: 150,
        startH: IGBT_WARNING_C,
        startHH: IGBT_CRITICAL_C
      }
    ]
  }
]

const ALL_TEMPERATURE_METRICS = TEMPERATURE_CATEGORIES.flatMap((category) => category.metrics)
const TOTAL_CHANNEL_COUNT = ALL_TEMPERATURE_METRICS.length
const WAGO_LIVE_POLL_MS = 1000
const MOTOR_TWO_HOLDING_REGISTER_OVERRIDES: Readonly<Record<string, number>> = {
  'coolant-temp': 400024,
  'coolant-pressure': 400025
}
const WAGO_HOLDING_REGISTERS = Array.from(
  new Set(
    ALL_TEMPERATURE_METRICS.flatMap((metric) => {
      if (metric.deviceRole !== 'wago' || typeof metric.modbusRegister !== 'number') {
        return []
      }

      const overrideRegister = MOTOR_TWO_HOLDING_REGISTER_OVERRIDES[metric.id]
      return typeof overrideRegister === 'number'
        ? [metric.modbusRegister, overrideRegister]
        : [metric.modbusRegister]
    })
  )
).sort((left, right) => left - right)
const WAGO_TEMPERATURE_SPARE_INPUT_ADDRESSES = WAGO_TEMPERATURE_SPARE_ROWS.map(
  (row) => row.sourceOffset
)

const getMotorWagoLiveDeviceId = (scope: MotorScope): 'wago_live_motor1' | 'wago_live_motor2' =>
  scope === 2 ? 'wago_live_motor2' : 'wago_live_motor1'

const getResolvedWagoHoldingRegister = (
  metric: TemperatureMetric,
  scope: MotorScope
): number | undefined => {
  if (metric.deviceRole !== 'wago' || typeof metric.modbusRegister !== 'number') {
    return metric.modbusRegister
  }

  if (scope === 2) {
    return MOTOR_TWO_HOLDING_REGISTER_OVERRIDES[metric.id] ?? metric.modbusRegister
  }

  return metric.modbusRegister
}

const toHoldingRegisterOffset = (modbusRegister: number): number => modbusRegister - 400001

const toNumber = (value: unknown): number | null => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const fahrenheitToCelsius = (value: number | null): number | null => {
  if (value === null || Number.isNaN(value)) return null
  return ((value - 32) * 5) / 9
}

const toDisplayMetricValue = (
  value: number | null,
  kind: MetricKind,
  temperatureUnit: TemperatureUnit
): number | null => {
  if (value === null || Number.isNaN(value)) return null

  if (kind === 'temperature-celsius') {
    return toDisplayTemperature(value, temperatureUnit)
  }

  if (kind === 'temperature-fahrenheit') {
    // WAGO/PLC temperature registers on this screen arrive in Fahrenheit (DEGF).
    return temperatureUnit === 'fahrenheit' ? value : fahrenheitToCelsius(value)
  }

  return value
}

const toDisplayMetricUnit = (
  kind: MetricKind,
  temperatureUnit: TemperatureUnit,
  fallback?: string
): string => {
  if (kind === 'pressure') {
    return fallback ?? ''
  }

  return getTemperatureUnitLabel(temperatureUnit)
}

const isMetricInAlarm = ({
  value,
  endLL,
  endL,
  startH,
  startHH
}: {
  value: number | null
  endLL?: number
  endL?: number
  startH?: number
  startHH?: number
}): boolean => {
  if (value === null) return false
  if (endLL !== undefined && value <= endLL) return true
  if (endL !== undefined && value <= endL) return true
  if (startHH !== undefined && value >= startHH) return true
  if (startH !== undefined && value >= startH) return true
  return false
}

const formatMetricValue = (value: number | null): string => {
  if (value === null) return '--'
  return value.toFixed(1)
}

type LiveTemperatureMetric = TemperatureMetric & {
  unit: string
  value: number | null
  isAlarm: boolean
  alertSeverity: TemperatureAlertSeverity
  animateAlert: boolean
}

type LiveTemperatureCategory = Omit<TemperatureCategory, 'metrics'> & {
  metrics: LiveTemperatureMetric[]
  alarmCount: number
}

type SpareTemperatureRow = {
  id: string
  signalLabel: string
  displayName: string
  rawValue: number | null
  displayValue: number | null
}

const TemperaturesScreen = () => {
  const { isViewOnly } = useAccessMode()
  const isBelowMobileViewport = useIsViewportBelow(768)
  const isMobileViewOnly = isViewOnly && isBelowMobileViewport
  const [selectedMotor, setSelectedMotor] = useState<MotorScope>(1)
  const [motorControlMode] = useMotorControlModePreference()
  const [temperatureUnit, setTemperatureUnit] = useTemperatureUnitPreference()
  const displayNameOverrides = useWagoDisplayNameOverrides()
  const [wagoHoldingValues, setWagoHoldingValues] = useState<Record<number, number | null>>({})
  const [isSpareTemperaturesOpen, setIsSpareTemperaturesOpen] = useState(false)
  const [wagoSpareInputValues, setWagoSpareInputValues] = useState<Record<number, number | null>>(
    {}
  )
  const [wagoSpareInputsConnected, setWagoSpareInputsConnected] = useState(false)
  const isDualMotorMode = motorControlMode === 'dual'
  const singleMotorScope = usePreferredSingleMotorScope()
  const activeMotorScope: MotorScope = isDualMotorMode ? selectedMotor : singleMotorScope
  const selectedDriveDeviceId = getMotorDriveDeviceId(activeMotorScope)
  const selectedWagoDeviceId = getMotorWagoDeviceId(activeMotorScope)
  const selectedWagoLiveDeviceId = getMotorWagoLiveDeviceId(activeMotorScope)

  const { raw: driveRaw } = useDeviceData(selectedDriveDeviceId)

  const selectedMotorLabel = `Motor #${activeMotorScope}`
  const headerMeta = isDualMotorMode
    ? `${selectedMotorLabel} - All Categories - ${TOTAL_CHANNEL_COUNT} channels`
    : `All Categories - ${TOTAL_CHANNEL_COUNT} channels`
  const unitToggleControl = (
    <S.UnitToggleGroup>
      <S.UnitToggleButton
        type="button"
        $active={temperatureUnit === 'celsius'}
        onClick={() => setTemperatureUnit('celsius')}
      >
        Celsius
      </S.UnitToggleButton>
      <S.UnitToggleButton
        type="button"
        $active={temperatureUnit === 'fahrenheit'}
        onClick={() => setTemperatureUnit('fahrenheit')}
      >
        Fahrenheit
      </S.UnitToggleButton>
    </S.UnitToggleGroup>
  )
  const spareTemperatureButton = (
    <S.SpareTemperatureButton type="button" onClick={() => setIsSpareTemperaturesOpen(true)}>
      <ListTree size={16} />
      Spare Temps
    </S.SpareTemperatureButton>
  )
  const headerRightContent = isDualMotorMode ? (
    <S.HeaderRightLayout>
      <S.HeaderCenterControls>
        <S.HeaderMotorSelector>
          <S.HeaderMotorButton
            type="button"
            $active={selectedMotor === 2}
            onClick={() => setSelectedMotor(2)}
          >
            Motor #2
          </S.HeaderMotorButton>
          <S.HeaderMotorButton
            type="button"
            $active={selectedMotor === 1}
            onClick={() => setSelectedMotor(1)}
          >
            Motor #1
          </S.HeaderMotorButton>
        </S.HeaderMotorSelector>
      </S.HeaderCenterControls>
      <S.HeaderRightInfo>
        <S.HeaderMetaText>{headerMeta}</S.HeaderMetaText>
        {spareTemperatureButton}
        {unitToggleControl}
      </S.HeaderRightInfo>
    </S.HeaderRightLayout>
  ) : (
    <S.HeaderRightInfo>
      <S.HeaderMetaText>{headerMeta}</S.HeaderMetaText>
      {spareTemperatureButton}
      {unitToggleControl}
    </S.HeaderRightInfo>
  )

  const driveParameterIds = useMemo(
    () =>
      ALL_TEMPERATURE_METRICS.filter((metric) => metric.deviceRole === 'drive').map(
        (metric) => metric.parameterId
      ),
    []
  )

  useOnDemandParameters({
    deviceId: selectedDriveDeviceId,
    parameterIds: driveParameterIds,
    limit: 24
  })

  useEffect(() => {
    let mounted = true

    const loadWagoHoldingSnapshot = async () => {
      try {
        const snapshot = await fetchWagoLiveSnapshot({
          deviceId: selectedWagoLiveDeviceId,
          registerType: 'holding',
          addresses: WAGO_HOLDING_REGISTERS.map(toHoldingRegisterOffset)
        })

        if (!mounted) {
          return
        }

        const nextValues = snapshot.values.reduce<Record<number, number | null>>((map, entry) => {
          map[entry.modbus_register] = entry.value
          return map
        }, {})

        setWagoHoldingValues(nextValues)
      } catch {
        if (mounted) {
          setWagoHoldingValues({})
        }
      }
    }

    void loadWagoHoldingSnapshot()
    const intervalId = window.setInterval(() => {
      void loadWagoHoldingSnapshot()
    }, WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [selectedWagoLiveDeviceId])

  useEffect(() => {
    if (!isSpareTemperaturesOpen) {
      return
    }

    let mounted = true

    const loadWagoSpareInputSnapshot = async () => {
      try {
        const snapshot = await fetchWagoLiveSnapshot({
          deviceId: selectedWagoDeviceId,
          registerType: 'input',
          addresses: WAGO_TEMPERATURE_SPARE_INPUT_ADDRESSES
        })

        if (!mounted) {
          return
        }

        const nextValues = snapshot.values.reduce<Record<number, number | null>>((map, entry) => {
          map[entry.address] = entry.value
          return map
        }, {})

        setWagoSpareInputValues(nextValues)
        setWagoSpareInputsConnected(snapshot.connected)
      } catch {
        if (mounted) {
          setWagoSpareInputValues({})
          setWagoSpareInputsConnected(false)
        }
      }
    }

    void loadWagoSpareInputSnapshot()
    const intervalId = window.setInterval(() => {
      void loadWagoSpareInputSnapshot()
    }, WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [isSpareTemperaturesOpen, selectedWagoDeviceId])

  const liveCategories = useMemo<LiveTemperatureCategory[]>(() => {
    return TEMPERATURE_CATEGORIES.map((category) => {
      const metrics = category.metrics.map((metric) => {
        const resolvedModbusRegister = getResolvedWagoHoldingRegister(metric, activeMotorScope)
        const baseValue =
          metric.deviceRole === 'drive'
            ? toNumber(driveRaw?.[metric.parameterId])
            : toNumber(
                typeof resolvedModbusRegister === 'number'
                  ? wagoHoldingValues[resolvedModbusRegister]
                  : null
              )
        const value = toDisplayMetricValue(baseValue, metric.kind, temperatureUnit)
        const startH =
          toDisplayMetricValue(metric.startH ?? null, metric.kind, temperatureUnit) ?? undefined
        const startHH =
          toDisplayMetricValue(metric.startHH ?? null, metric.kind, temperatureUnit) ?? undefined
        const endL =
          toDisplayMetricValue(metric.endL ?? null, metric.kind, temperatureUnit) ?? undefined
        const endLL =
          toDisplayMetricValue(metric.endLL ?? null, metric.kind, temperatureUnit) ?? undefined
        const unit = toDisplayMetricUnit(metric.kind, temperatureUnit, metric.unitLabel)
        const usesSharedTemperatureThreshold =
          metric.kind !== 'pressure' && metric.parameterId !== 'Coolant_Temp_DEGF'
        const alertSeverity = getMotorTemperatureAlertSeverity(
          metric.parameterId,
          value,
          metric.kind === 'pressure' ? 'fahrenheit' : temperatureUnit
        )
        const animateAlert = shouldAnimateMotorTemperatureAlert(
          metric.parameterId,
          value,
          metric.kind === 'pressure' ? 'fahrenheit' : temperatureUnit
        )
        const isAlarm = usesSharedTemperatureThreshold
          ? alertSeverity !== 'normal'
          : isMetricInAlarm({ value, endLL, endL, startH, startHH })

        return {
          ...metric,
          unit,
          value,
          isAlarm,
          alertSeverity,
          animateAlert
        }
      })

      return {
        ...category,
        metrics,
        alarmCount: metrics.filter((metric) => metric.isAlarm).length
      }
    })
  }, [driveRaw, activeMotorScope, temperatureUnit, wagoHoldingValues])

  const spareTemperatureRows = useMemo<SpareTemperatureRow[]>(() => {
    return WAGO_TEMPERATURE_SPARE_ROWS.map((row) => {
      const rawValue = toNumber(wagoSpareInputValues[row.sourceOffset])
      const fahrenheitValue = rawValue === null ? null : toWagoTemperatureSpareFahrenheit(rawValue)
      const displayValue =
        temperatureUnit === 'fahrenheit' ? fahrenheitValue : fahrenheitToCelsius(fahrenheitValue)

      return {
        id: row.id,
        signalLabel: formatWagoTemperatureSpareSignalLabel(row.sourceOffset),
        displayName: getWagoTemperatureSpareDisplayName(row, displayNameOverrides),
        rawValue,
        displayValue
      }
    })
  }, [displayNameOverrides, temperatureUnit, wagoSpareInputValues])

  const spareTemperatureUnitLabel = getTemperatureUnitLabel(temperatureUnit)

  return (
    <ScreenLayout>
      <S.MainContainer>
        <Panel
          position={isMobileViewOnly ? undefined : { left: 20, top: 20 }}
          width={isMobileViewOnly ? '100%' : 1880}
          height={isMobileViewOnly ? 'auto' : 820}
        >
          <Card title="Temperatures" icon={Thermometer} headerRight={headerRightContent}>
            <S.ScreenShell>
              <S.ContentGrid>
                <S.SectionBoard>
                  <S.SectionScroller>
                    <S.SectionList>
                      {liveCategories.map((category) => {
                        const Icon = category.icon

                        return (
                          <S.CategorySection
                            key={category.key}
                            $accent={category.accent}
                            $alarm={category.alarmCount > 0}
                            $layout={category.key}
                          >
                            <S.CategorySectionHeader>
                              <S.CategorySectionTitleRow>
                                <S.CategorySectionIcon $accent={category.accent}>
                                  <Icon size={24} />
                                </S.CategorySectionIcon>
                                <S.CategorySectionHeading>
                                  <S.CategorySectionTitle>{category.title}</S.CategorySectionTitle>
                                  <S.CategorySectionDescription>
                                    {category.description}
                                  </S.CategorySectionDescription>
                                </S.CategorySectionHeading>
                              </S.CategorySectionTitleRow>
                            </S.CategorySectionHeader>

                            <S.MetricGrid $layout={category.key}>
                              {category.metrics.map((metric) => (
                                <S.MetricCard
                                  key={metric.id}
                                  $alarm={metric.isAlarm}
                                  $animateAlert={metric.animateAlert}
                                  $severity={metric.alertSeverity}
                                  $layout={category.key}
                                  $accent={category.accent}
                                >
                                  <S.MetricCardTop>
                                    <S.MetricLabel>{metric.label}</S.MetricLabel>
                                  </S.MetricCardTop>

                                  <S.MetricValueRow>
                                    <S.MetricValue
                                      $alarm={metric.isAlarm}
                                      $animateAlert={metric.animateAlert}
                                      $severity={metric.alertSeverity}
                                      $layout={category.key}
                                    >
                                      {formatMetricValue(metric.value)}
                                    </S.MetricValue>
                                    <S.MetricUnit $layout={category.key}>
                                      {metric.unit}
                                    </S.MetricUnit>
                                  </S.MetricValueRow>
                                </S.MetricCard>
                              ))}
                            </S.MetricGrid>
                          </S.CategorySection>
                        )
                      })}
                    </S.SectionList>
                  </S.SectionScroller>
                </S.SectionBoard>
              </S.ContentGrid>
            </S.ScreenShell>
          </Card>
        </Panel>
      </S.MainContainer>
      <ModalBase
        isOpen={isSpareTemperaturesOpen}
        onRequestClose={() => setIsSpareTemperaturesOpen(false)}
        width={1120}
        maxWidth="94vw"
        maxHeight="90vh"
        ariaLabel="WAGO spare temperature inputs"
      >
        <S.SpareTemperatureModal>
          <S.SpareTemperatureModalHeader>
            <S.SpareTemperatureModalTitleBlock>
              <S.SpareTemperatureModalTitle>WAGO Spare Temperatures</S.SpareTemperatureModalTitle>
              <S.SpareTemperatureModalSubtitle>
                {selectedMotorLabel} -{' '}
                {wagoSpareInputsConnected ? 'Live input values' : 'Waiting for WAGO input values'}
              </S.SpareTemperatureModalSubtitle>
            </S.SpareTemperatureModalTitleBlock>
            <S.SpareTemperatureCloseButton
              type="button"
              aria-label="Close spare temperature window"
              onClick={() => setIsSpareTemperaturesOpen(false)}
            >
              <X size={18} />
            </S.SpareTemperatureCloseButton>
          </S.SpareTemperatureModalHeader>

          <S.SpareTemperatureDescription>
            These values are scaled only in this temperature window with ((raw_value / 10) * 9/5) +
            32 for Fahrenheit monitoring. The WAGO I/O Cards screen continues to show the unchanged
            raw PLC values.
          </S.SpareTemperatureDescription>

          <S.SpareTemperatureTable>
            <S.SpareTemperatureTableHead>
              <span>I/O Point</span>
              <span>Name</span>
              <span>Temperature</span>
              <span>Raw PLC Value</span>
            </S.SpareTemperatureTableHead>
            <S.SpareTemperatureTableBody>
              {spareTemperatureRows.map((row) => (
                <S.SpareTemperatureTableRow key={row.id}>
                  <S.SpareTemperatureSignal>{row.signalLabel}</S.SpareTemperatureSignal>
                  <S.SpareTemperatureName>{row.displayName}</S.SpareTemperatureName>
                  <S.SpareTemperatureValue>
                    {formatMetricValue(row.displayValue)}
                    <S.SpareTemperatureUnit>{spareTemperatureUnitLabel}</S.SpareTemperatureUnit>
                  </S.SpareTemperatureValue>
                  <S.SpareTemperatureRawValue>
                    {row.rawValue === null ? '--' : row.rawValue.toFixed(0)}
                  </S.SpareTemperatureRawValue>
                </S.SpareTemperatureTableRow>
              ))}
            </S.SpareTemperatureTableBody>
          </S.SpareTemperatureTable>
        </S.SpareTemperatureModal>
      </ModalBase>
    </ScreenLayout>
  )
}

export default TemperaturesScreen
