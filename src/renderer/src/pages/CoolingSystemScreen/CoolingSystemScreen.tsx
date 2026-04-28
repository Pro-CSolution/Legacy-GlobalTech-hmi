import { useMemo, useState } from 'react'
import { Fan, Play, Square } from 'lucide-react'
import ActionButton from 'components/ActionButton'
import Card from 'components/Card'
import Panel from 'components/Panel'
import VerticalGauge from 'components/VerticalGauge'
import {
  useAccessMode,
  useDeviceData,
  useIsViewportBelow,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  useSendCommand,
  useTopBannerNotice,
  useTemperatureUnitPreference
} from 'hooks'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { ScreenLayout } from 'layouts'
import { applyVariableDisplayValue, getVariableDisplayUnit } from 'pages/TrendScreen/constants'
import { type ParameterId } from 'types'
import {
  getMotorCoolingPlcDeviceId,
  getMotorWagoDeviceId,
  type MotorScope
} from 'utils/motorDeviceMapping'
import * as S from './CoolingSystemScreen.styles'

type BasicTone = 'ok' | 'warn' | 'fault' | 'off'

type PumpConfig = {
  key: 'pump1' | 'pump2'
  title: string
  runOutputId: ParameterId
  startCommandId: ParameterId
  stopCommandId: ParameterId
  runningId: ParameterId
}

type IndicationCard = {
  key: string
  label: string
  tone: BasicTone
  valueLabel: string
  compact?: boolean
}

const PUMPS: PumpConfig[] = [
  {
    key: 'pump1',
    title: 'Coolant Pump 1',
    runOutputId: 'Coolant_Pump1_Run',
    startCommandId: 'CoolPump1_HMI_Start',
    stopCommandId: 'CoolPump1_HMI_Stop',
    runningId: 'Drive_Coolant_Pump1_Running'
  },
  {
    key: 'pump2',
    title: 'Coolant Pump 2',
    runOutputId: 'Coolant_Pump2_Run',
    startCommandId: 'CoolPump2_HMI_Start',
    stopCommandId: 'CoolPump2_HMI_Stop',
    runningId: 'Drive_Coolant_Pump2_Running'
  }
]

const resolveUiPumpConfig = (pump: PumpConfig, scope: MotorScope): PumpConfig => {
  if (scope === 1 && pump.key === 'pump1') {
    const pump2 = PUMPS.find((candidate) => candidate.key === 'pump2')
    if (pump2) {
      return {
        ...pump,
        startCommandId: pump2.startCommandId,
        stopCommandId: pump2.stopCommandId
      }
    }
  }

  return pump
}

const COOLING_COMMAND_PARAMETER_IDS: string[] = [
  'CoolPump1_HMI_Start',
  'CoolPump1_HMI_Stop',
  'CoolPump2_HMI_Start',
  'CoolPump2_HMI_Stop',
  'CoolSys_OK'
]

const COOLING_STATUS_PARAMETER_IDS: ParameterId[] = [
  'Coolant_Pump1_Run',
  'Coolant_Pump2_Run',
  'Drive_Coolant_Pump1_Running',
  'Drive_Coolant_Pump2_Running',
  'Drive_Coolant_Flow_Sw',
  'Drive_Coolant Leak_Sw',
  'Coolant_Pressure_PSI',
  'Coolant_Temp_DEGF'
]

const COOLING_PUMP_START_HOLD_MS = 2000
const COOLING_PUMP_STOP_HOLD_MS = 500
const COOLING_PUMP_COMMAND_REFRESH_MS = 250
const COOLANT_PRESSURE_OK_THRESHOLD_PSI = 15

const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const toBooleanState = (value: unknown): boolean | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (!normalized) return null
    if (['0', 'false', 'off', 'no'].includes(normalized)) return false
    if (['1', 'true', 'on', 'yes'].includes(normalized)) return true
  }

  return Boolean(value)
}

const toNumber = (value: unknown): number | null => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const resolvePressureIndicator = (
  coolantPsi: number | null
): Pick<IndicationCard, 'tone' | 'valueLabel'> => {
  if (coolantPsi === null) {
    return {
      tone: 'off',
      valueLabel: '--'
    }
  }

  if (coolantPsi < COOLANT_PRESSURE_OK_THRESHOLD_PSI) {
    return {
      tone: 'fault',
      valueLabel: 'Fault'
    }
  }

  return {
    tone: 'ok',
    valueLabel: 'OK'
  }
}

const resolveBinaryIndicator = (
  value: boolean | null,
  options?: {
    invert?: boolean
    inactiveLabel?: string
    inactiveTone?: BasicTone
  }
): Pick<IndicationCard, 'tone' | 'valueLabel'> => {
  if (value === null) {
    return {
      tone: 'off',
      valueLabel: '--'
    }
  }

  const isOk = options?.invert ? !value : value
  if (isOk) {
    return {
      tone: 'ok',
      valueLabel: 'OK'
    }
  }

  return {
    tone: options?.inactiveTone ?? 'fault',
    valueLabel: options?.inactiveLabel ?? 'Fault'
  }
}

const CoolingSystemScreen = () => {
  const { isViewOnly } = useAccessMode()
  const isMobileViewOnly = isViewOnly && useIsViewportBelow(768)
  const [selectedMotor, setSelectedMotor] = useState<MotorScope>(1)
  const [pendingCommand, setPendingCommand] = useState<{
    scope: MotorScope
    parameterId: ParameterId
    action: 'start' | 'stop'
  } | null>(null)
  const [motorControlMode] = useMotorControlModePreference()
  const [temperatureUnit] = useTemperatureUnitPreference()
  const { writeParameter } = useSendCommand()
  const { showNotice } = useTopBannerNotice()

  const isDualMotorMode = motorControlMode === 'dual'
  const singleMotorScope = usePreferredSingleMotorScope()
  const activeMotorScope: MotorScope = isDualMotorMode ? selectedMotor : singleMotorScope
  const selectedCoolingCommandDeviceId = getMotorCoolingPlcDeviceId(activeMotorScope)
  const selectedCoolingStatusDeviceId = getMotorWagoDeviceId(activeMotorScope)
  const { raw: coolingCommandRaw, isConnected: socketConnected } = useDeviceData(
    selectedCoolingCommandDeviceId
  )
  const { raw: coolingStatusRaw } = useDeviceData(selectedCoolingStatusDeviceId)

  useOnDemandParameters({
    deviceId: selectedCoolingCommandDeviceId,
    parameterIds: COOLING_COMMAND_PARAMETER_IDS,
    limit: COOLING_COMMAND_PARAMETER_IDS.length
  })

  useOnDemandParameters({
    deviceId: selectedCoolingStatusDeviceId,
    parameterIds: COOLING_STATUS_PARAMETER_IDS,
    limit: COOLING_STATUS_PARAMETER_IDS.length
  })

  const setMotorNotice = (
    _scope: MotorScope,
    notice: { tone: 'success' | 'error'; message: string } | null
  ) => {
    if (notice) {
      showNotice(notice, 4000)
    }
  }

  const coolingCommandConnected = socketConnected && Boolean(coolingCommandRaw['__connected'])
  const coolingStatusConnected = socketConnected && Boolean(coolingStatusRaw['__connected'])
  const coolingDeviceConnected = coolingCommandConnected && coolingStatusConnected
  const connectionTone: BasicTone =
    coolingDeviceConnected ? 'ok' : coolingCommandConnected || coolingStatusConnected ? 'warn' : socketConnected ? 'warn' : 'off'
  const connectionLabel =
    coolingDeviceConnected
      ? 'Cooling PLC/WAGO Live'
      : coolingCommandConnected || coolingStatusConnected
        ? 'Cooling PLC/WAGO Partial'
        : socketConnected
          ? 'Cooling PLC/WAGO Offline'
          : 'Socket Offline'
  const pump1FeedbackRunning = toBooleanState(coolingStatusRaw['Drive_Coolant_Pump1_Running'])
  const pump2FeedbackRunning = toBooleanState(coolingStatusRaw['Drive_Coolant_Pump2_Running'])
  const flowOk = toBooleanState(coolingStatusRaw['Drive_Coolant_Flow_Sw'])
  const leakActive = toBooleanState(coolingStatusRaw['Drive_Coolant Leak_Sw'])

  const coolantPsiRaw = toNumber(coolingCommandRaw['Coolant_Pressure_PSI'])
  const coolSysOkBit = toBooleanState(coolingCommandRaw['CoolSys_OK'])
  const coolSysOk =
    coolSysOkBit !== null
      ? coolSysOkBit
      : pump1FeedbackRunning === null ||
          pump2FeedbackRunning === null ||
          flowOk === null ||
          leakActive === null ||
          coolantPsiRaw === null
        ? null
        : (pump1FeedbackRunning || pump2FeedbackRunning) &&
          flowOk &&
          !leakActive &&
          coolantPsiRaw >= COOLANT_PRESSURE_OK_THRESHOLD_PSI

  const pumpCards = useMemo(
    () =>
      PUMPS.map((pump) => {
        const resolvedPump = resolveUiPumpConfig(pump, activeMotorScope)
        const commandActive = toBooleanState(coolingCommandRaw[resolvedPump.runOutputId])
        const feedbackRunning =
          resolvedPump.runningId === 'Drive_Coolant_Pump1_Running'
            ? pump1FeedbackRunning
            : pump2FeedbackRunning
        const pendingAction =
          pendingCommand?.scope === activeMotorScope &&
          pendingCommand.parameterId === resolvedPump.startCommandId
            ? 'start'
            : pendingCommand?.scope === activeMotorScope &&
                pendingCommand.parameterId === resolvedPump.stopCommandId
              ? 'stop'
              : null

        return {
          ...resolvedPump,
          title: pump.title,
          commandActive,
          feedbackRunning,
          running: feedbackRunning,
          isPending: pendingAction !== null,
          pendingAction
        }
      }),
    [pendingCommand, pump1FeedbackRunning, pump2FeedbackRunning, coolingCommandRaw, activeMotorScope]
  )

  const coolantPsi =
    coolantPsiRaw === null
      ? null
      : applyVariableDisplayValue('Coolant_Pressure_PSI', coolantPsiRaw, temperatureUnit)
  const coolantPsiUnit =
    getVariableDisplayUnit('Coolant_Pressure_PSI', 'PSI', temperatureUnit) || 'PSI'
  const coolantTempRawF = toNumber(coolingCommandRaw['Coolant_Temp_DEGF'])
  const coolantTempDisplay =
    coolantTempRawF !== null
      ? applyVariableDisplayValue('Coolant_Temp_DEGF', coolantTempRawF, temperatureUnit)
      : null
  const coolantTempUnit = getVariableDisplayUnit('Coolant_Temp_DEGF', 'deg F', temperatureUnit)
  const coolantTempHigh = temperatureUnit === 'fahrenheit' ? 140 : 60
  const coolantTempHighHigh = temperatureUnit === 'fahrenheit' ? 167 : 75
  const coolantTempMax = temperatureUnit === 'fahrenheit' ? 200 : 93.3

  const indicationGroups = useMemo(
    () => ({
      primary: [
        {
          key: 'coolant-system',
          label: 'Coolant System',
          ...resolveBinaryIndicator(coolSysOk)
        },
        {
          key: 'flow',
          label: 'Flow',
          ...resolveBinaryIndicator(flowOk)
        }
      ] satisfies IndicationCard[],
      secondary: [
        {
          key: 'pressure',
          label: 'Pressure',
          compact: true,
          ...resolvePressureIndicator(coolantPsiRaw)
        },
        {
          key: 'temp',
          label: 'Temp',
          compact: true,
          ...resolveBinaryIndicator(true)
        },
        {
          key: 'leak',
          label: 'Leak',
          compact: true,
          ...resolveBinaryIndicator(leakActive, {
            invert: true,
            inactiveLabel: 'Leak',
            inactiveTone: 'fault'
          })
        }
      ] satisfies IndicationCard[]
    }),
    [coolSysOk, coolantPsiRaw, flowOk, leakActive]
  )

  const handlePumpCommand = async (pump: PumpConfig, action: 'start' | 'stop') => {
    if (pendingCommand) return

    const scope = activeMotorScope
    const targetDeviceId = getMotorCoolingPlcDeviceId(scope)
    const commandParameterId = action === 'start' ? pump.startCommandId : pump.stopCommandId
    setMotorNotice(scope, null)
    setPendingCommand({
      scope,
      parameterId: commandParameterId,
      action
    })

    try {
      const writeCommand = async (
        parameterId: ParameterId,
        value: 0 | 1,
        errorMessage: string
      ) => {
        const wrote = await writeParameter({
          deviceId: targetDeviceId,
          parameterId,
          value
        })

        if (!wrote) {
          throw new Error(errorMessage)
        }
      }

      const holdMomentaryCommand = async (
        parameterId: ParameterId,
        holdMs: number,
        commandLabel: string
      ) => {
        const holdUntil = Date.now() + holdMs

        await writeCommand(parameterId, 1, `Failed to send ${commandLabel}.`)

        while (Date.now() < holdUntil) {
          await delay(Math.min(COOLING_PUMP_COMMAND_REFRESH_MS, holdUntil - Date.now()))
          if (Date.now() < holdUntil) {
            await writeCommand(parameterId, 1, `Failed to sustain ${commandLabel}.`)
          }
        }

        await writeCommand(parameterId, 0, `Failed to clear ${commandLabel}.`)
      }

      if (action === 'start') {
        await writeCommand(
          pump.stopCommandId,
          0,
          `Failed to clear ${pump.title} stop command before starting.`
        )
        await writeCommand(
          pump.startCommandId,
          0,
          `Failed to reset ${pump.title} start command before starting.`
        )
        await holdMomentaryCommand(
          pump.startCommandId,
          COOLING_PUMP_START_HOLD_MS,
          `${pump.title} start command`
        )
      } else {
        await writeCommand(
          pump.startCommandId,
          0,
          `Failed to clear ${pump.title} start command before stopping.`
        )
        await writeCommand(
          pump.stopCommandId,
          0,
          `Failed to reset ${pump.title} stop command before stopping.`
        )
        await holdMomentaryCommand(
          pump.stopCommandId,
          COOLING_PUMP_STOP_HOLD_MS,
          `${pump.title} stop command`
        )
      }

      setMotorNotice(scope, {
        tone: 'success',
        message:
          action === 'start'
            ? `${pump.title} start command held for 2 seconds.`
            : `${pump.title} stop command pulsed.`
      })
    } catch (error) {
      setMotorNotice(scope, {
        tone: 'error',
        message: (error as Error)?.message || `Failed to update ${pump.title} command.`
      })
    } finally {
      setPendingCommand(null)
    }
  }

  const headerRight = (
    <S.HeaderControls>
      <S.ConnectionBadge $tone={connectionTone}>{connectionLabel}</S.ConnectionBadge>
      {isDualMotorMode ? (
        <S.MotorSelector>
          <S.MotorButton
            type="button"
            $active={selectedMotor === 2}
            onClick={() => setSelectedMotor(2)}
          >
            Motor #2
          </S.MotorButton>
          <S.MotorButton
            type="button"
            $active={selectedMotor === 1}
            onClick={() => setSelectedMotor(1)}
          >
            Motor #1
          </S.MotorButton>
        </S.MotorSelector>
      ) : null}
    </S.HeaderControls>
  )

  return (
    <ScreenLayout>
      <S.MainContainer>
        <Panel
          position={isMobileViewOnly ? undefined : { left: 20, top: 20 }}
          width={isMobileViewOnly ? '100%' : 1880}
          height={isMobileViewOnly ? 'auto' : 820}
        >
          <Card title="Cooling System" icon={Fan} headerRight={headerRight}>
            <S.ContentGrid>
              <S.LeftPane>
                <S.PumpGrid>
                  {pumpCards.map((pump) => {
                    const stateTone: BasicTone = pump.isPending
                      ? 'warn'
                      : pump.running === null
                        ? 'off'
                        : pump.running
                          ? 'ok'
                          : 'off'

                    const stateLabel = pump.isPending
                      ? 'Sending'
                      : pump.running === null
                        ? '--'
                        : pump.running
                          ? 'Running'
                          : 'Stopped'

                    return (
                      <S.PumpCard key={pump.key}>
                        <S.PumpTitle>{pump.title}</S.PumpTitle>
                        <S.PumpState $tone={stateTone}>{stateLabel}</S.PumpState>

                        <S.PumpButtons>
                          <ActionButton
                            label="Start"
                            color="green"
                            icon={Play}
                            active={pump.isPending ? pump.pendingAction === 'start' : pump.commandActive === true}
                            disabled={
                              isViewOnly || !coolingDeviceConnected || pendingCommand !== null
                            }
                            onClick={() => {
                              void handlePumpCommand(pump, 'start')
                            }}
                          />
                          <ActionButton
                            label="Stop"
                            color="red"
                            icon={Square}
                            active={
                              pump.isPending
                                ? pump.pendingAction === 'stop'
                                : pump.commandActive === false
                            }
                            disabled={
                              isViewOnly || !coolingDeviceConnected || pendingCommand !== null
                            }
                            onClick={() => {
                              void handlePumpCommand(pump, 'stop')
                            }}
                          />
                        </S.PumpButtons>
                      </S.PumpCard>
                    )
                  })}
                </S.PumpGrid>

                <S.IndicationSection>
                  <S.IndicationRow $columns={2}>
                    {indicationGroups.primary.map((item) => (
                      <S.IndicationCard key={item.key} $tone={item.tone}>
                        <S.IndicationTitle>{item.label}</S.IndicationTitle>
                        <S.IndicationValue>{item.valueLabel}</S.IndicationValue>
                      </S.IndicationCard>
                    ))}
                  </S.IndicationRow>

                  <S.IndicationRow $columns={3}>
                    {indicationGroups.secondary.map((item) => (
                      <S.IndicationCard key={item.key} $tone={item.tone} $compact>
                        <S.IndicationTitle>{item.label}</S.IndicationTitle>
                        <S.IndicationValue $compact>{item.valueLabel}</S.IndicationValue>
                      </S.IndicationCard>
                    ))}
                  </S.IndicationRow>
                </S.IndicationSection>
              </S.LeftPane>

              <S.RightPane>
                <S.GaugeCard>
                  <S.GaugeTitle>Coolant PSI</S.GaugeTitle>
                  <S.GaugeMeta>
                    {coolantPsi === null
                      ? 'Waiting for live data'
                      : `${coolantPsi.toFixed(1)} ${coolantPsiUnit}`}
                  </S.GaugeMeta>
                  <S.GaugeBody>
                    <VerticalGauge
                      value={coolantPsi ?? 0}
                      minValue={0}
                      maxValue={60}
                      unitOfMeasure={coolantPsiUnit}
                      endL={18}
                      endLL={10}
                      size={{ width: 120, height: 250 }}
                    />
                  </S.GaugeBody>
                </S.GaugeCard>

                <S.GaugeCard>
                  <S.GaugeTitle>Coolant Temp</S.GaugeTitle>
                  <S.GaugeMeta>
                    {coolantTempDisplay === null
                      ? 'Waiting for live data'
                      : `${coolantTempDisplay.toFixed(1)} ${coolantTempUnit}`}
                  </S.GaugeMeta>
                  <S.GaugeBody>
                    <VerticalGauge
                      value={coolantTempDisplay ?? 0}
                      minValue={0}
                      maxValue={coolantTempMax}
                      unitOfMeasure={coolantTempUnit}
                      startH={coolantTempHigh}
                      startHH={coolantTempHighHigh}
                      size={{ width: 120, height: 250 }}
                    />
                  </S.GaugeBody>
                </S.GaugeCard>
              </S.RightPane>
            </S.ContentGrid>
          </Card>
        </Panel>
      </S.MainContainer>
    </ScreenLayout>
  )
}

export default CoolingSystemScreen
