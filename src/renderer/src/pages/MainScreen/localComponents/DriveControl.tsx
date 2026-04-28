import { useEffect, useMemo, useState } from 'react'
import { Settings, Play, Square, RefreshCcw, AlertOctagon } from 'lucide-react'
import Card from 'components/Card'
import ActionButton from 'components/ActionButton'
import Panel from 'components/Panel'
import { DriveKeypad } from './DriveKeypad'
import { DriveParameterQuickModal } from './DriveParameterQuickModal'
import {
  DriveStatusBox,
  DriveStatusRow,
  DriveLabel,
  DriveState,
  DriveFaultBox,
  DriveControls,
  DriveContent,
  DriveKeypadSection,
  EmergencyStopContainer,
  ButtonGroup
} from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'
import { useAccessMode, useSendCommand, useTopBannerNotice } from 'hooks'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { useRealtime } from 'hooks/useRealtime'
import { updateDriveParameterScaleFactor } from 'services/driveService'
import { DriveParameter } from 'types/drive'
import { DeviceId, ParameterId } from 'types'
import { ParameterDetailModal } from '../../DriveParameters/components/ParameterDetailModal/ParameterDetailModal'
import { getMotorDriveDeviceId, getMotorWagoDeviceId } from 'utils/motorDeviceMapping'
import { hasActiveInterlockTrip } from 'utils/driveTripStatus'

const ETHERNET_CONTROL_WORD_PARAMETER_ID = 'P86.27' as ParameterId
const DRIVE_RAPID_STOP_WORD = 0x0008
const DRIVE_READY_WORD = 0x000d
const DRIVE_START_WORD = 0x000f
const DRIVE_STOP_WORD = 0x000c
const DRIVE_COMMAND_PULSE_MS = 500
const DRIVE_TRIP_RESET_PULSE_MS = 500
const ESTOP_RESET_PARAMETER_ID = 'RB_Estop_Reset' as ParameterId
const ESTOP_RESET_DRIVE_RESET_DELAY_MS = 100
const EMERGENCY_STOP_PARAMETER_ID = 'RB_Main_Brk_Open' as ParameterId
const WAGO_COMMAND_HOLD_MS = 2000
const WAGO_COMMAND_REFRESH_MS = 250
const CF0_SOURCE_PARAMETER_ID = 'P33.00' as ParameterId
const CF1_SOURCE_PARAMETER_ID = 'P33.01' as ParameterId
const CF2_SOURCE_PARAMETER_ID = 'P33.02' as ParameterId
const CF4_SOURCE_PARAMETER_ID = 'P33.04' as ParameterId
const CF5_SOURCE_PARAMETER_ID = 'P33.05' as ParameterId
const CF6_SOURCE_PARAMETER_ID = 'P33.06' as ParameterId
const CF7_SOURCE_PARAMETER_ID = 'P33.07' as ParameterId
const CF116_SOURCE_PARAMETER_ID = 'P34.16' as ParameterId
const SPEED_REFERENCE_SOURCE_PARAMETER_ID = 'P5.01' as ParameterId
const SPEED_REFERENCE_2_SOURCE_PARAMETER_ID = 'P5.02' as ParameterId
const SPEED_REFERENCE_3_SOURCE_PARAMETER_ID = 'P5.03' as ParameterId
const SPEED_REFERENCE_4_SOURCE_PARAMETER_ID = 'P5.04' as ParameterId
const BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID = 'P5.05' as ParameterId
const CLAMP_ZERO_REFERENCE_PARAMETER_ID = 'P5.21' as ParameterId
const POINTER_1_SOURCE_PARAMETER_ID = 'P42.00' as ParameterId
const POINTER_1_SCALE_PARAMETER_ID = 'P42.01' as ParameterId
const ETHERNET_REFERENCE_PARAMETER_ID = 'P86.25' as ParameterId
const ETHERNET_REFERENCE_FALLBACK_PARAMETER_ID = 'P86.29' as ParameterId
const ETHERNET_SPEED_REFERENCE_SOURCE_VALUE = 21
const KEYPAD_SPEED_REFERENCE_SOURCE_VALUE = 1
const ANALOG_REFERENCE_1_SOURCE_VALUE = 2
const ANALOG_REFERENCE_2_SOURCE_VALUE = 3
const ETHERNET_POINTER_SOURCE_VALUE = 86.25
const ETHERNET_POINTER_SCALE_VALUE = 100
const ETHERNET_REFERENCE_PRELOAD_VALUE = 0
const CONTROL_FLAG_SET_VALUE = 1
const CONTROL_FLAG_CLEAR_VALUE = 0
const DIGITAL_INPUT_REF1_SELECTOR_VALUE = -1004
const DIGITAL_INPUT_REF2_SELECTOR_VALUE = -1005
const DIGITAL_INPUT_REF3_SELECTOR_VALUE = 1005

const ETHERNET_MODE_VALUES: Record<string, number> = {
  [CF0_SOURCE_PARAMETER_ID]: 5300,
  [CF1_SOURCE_PARAMETER_ID]: 5301,
  [CF2_SOURCE_PARAMETER_ID]: 5302,
  [CF4_SOURCE_PARAMETER_ID]: CONTROL_FLAG_SET_VALUE,
  [CF5_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF6_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF7_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF116_SOURCE_PARAMETER_ID]: 5303,
  [POINTER_1_SOURCE_PARAMETER_ID]: ETHERNET_POINTER_SOURCE_VALUE,
  [POINTER_1_SCALE_PARAMETER_ID]: ETHERNET_POINTER_SCALE_VALUE,
  [BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]: KEYPAD_SPEED_REFERENCE_SOURCE_VALUE,
  [CLAMP_ZERO_REFERENCE_PARAMETER_ID]: 0,
  [SPEED_REFERENCE_SOURCE_PARAMETER_ID]: ETHERNET_SPEED_REFERENCE_SOURCE_VALUE
}

const DIGITAL_INPUT_MODE_VALUES: Record<string, number> = {
  [CF0_SOURCE_PARAMETER_ID]: 1002,
  [CF1_SOURCE_PARAMETER_ID]: 1002,
  [CF2_SOURCE_PARAMETER_ID]: 1,
  [CF4_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF1_SELECTOR_VALUE,
  [CF5_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF2_SELECTOR_VALUE,
  [CF6_SOURCE_PARAMETER_ID]: DIGITAL_INPUT_REF3_SELECTOR_VALUE,
  [CF7_SOURCE_PARAMETER_ID]: CONTROL_FLAG_CLEAR_VALUE,
  [CF116_SOURCE_PARAMETER_ID]: 1
}
const DIGITAL_INPUT_REFERENCE_VALUES: Record<string, number> = {
  [SPEED_REFERENCE_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_1_SOURCE_VALUE,
  [SPEED_REFERENCE_2_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_1_SOURCE_VALUE,
  [SPEED_REFERENCE_3_SOURCE_PARAMETER_ID]: ANALOG_REFERENCE_2_SOURCE_VALUE,
  [SPEED_REFERENCE_4_SOURCE_PARAMETER_ID]: KEYPAD_SPEED_REFERENCE_SOURCE_VALUE,
  [BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]: 0
}

type DriveMode = 'ethernet' | 'digital-input' | 'custom'

const getDriveModeLabel = (mode: Exclude<DriveMode, 'custom'>): string =>
  mode === 'ethernet' ? 'ConView Control' : 'Keypad Control'

interface DriveControlProps extends PositionProps {
  deviceId?: DeviceId
  wagoId?: DeviceId
  controlState: {
    driveRunning: boolean
    driveFault: boolean
  }
  setControlState: React.Dispatch<
    React.SetStateAction<{
      mode: string
      breaker: string
      driveRunning: boolean
      driveFault: boolean
      blower: string
      motorTempWarn: string
      motorTempHigh: string
    }>
  >
}

export const DriveControl = ({
  deviceId = getMotorDriveDeviceId(1),
  wagoId = getMotorWagoDeviceId(1),
  controlState,
  setControlState,
  ...positionProps
}: DriveControlProps) => {
  const { isViewOnly } = useAccessMode()
  const { writeParameter, executeAction } = useSendCommand()
  const { showNotice } = useTopBannerNotice()
  const { devicesData, subscribeDevice, unsubscribeDevice } = useRealtime()

  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)
  const [selectedParameter, setSelectedParameter] = useState<DriveParameter | null>(null)
  const [isSavingParam, setIsSavingParam] = useState(false)
  const [isEstopResetting, setIsEstopResetting] = useState(false)
  const [modeChangeInFlight, setModeChangeInFlight] = useState<DriveMode | null>(null)
  const [driveCommandInFlight, setDriveCommandInFlight] = useState<
    'start' | 'stop' | 'emergency-stop' | null
  >(null)
  const [saveResult, setSaveResult] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    subscribeDevice(deviceId)
    subscribeDevice(wagoId)
    return () => {
      unsubscribeDevice(deviceId)
      unsubscribeDevice(wagoId)
    }
  }, [deviceId, wagoId, subscribeDevice, unsubscribeDevice])

  const liveSnapshot = devicesData[deviceId] || {}
  const wagoSnapshot = devicesData[wagoId] || {}
  const liveValue = selectedParameter ? liveSnapshot[selectedParameter.id] : undefined
  const isDriveConnected = Boolean(liveSnapshot.__connected)
  const isWagoConnected = Boolean(wagoSnapshot.__connected)
  const isEstopPressed = hasActiveInterlockTrip(liveSnapshot)
  const modeParameterIds = useMemo(
    () => [
      CF0_SOURCE_PARAMETER_ID,
      CF1_SOURCE_PARAMETER_ID,
      CF2_SOURCE_PARAMETER_ID,
      CF4_SOURCE_PARAMETER_ID,
      CF5_SOURCE_PARAMETER_ID,
      CF6_SOURCE_PARAMETER_ID,
      CF7_SOURCE_PARAMETER_ID,
      CF116_SOURCE_PARAMETER_ID,
      SPEED_REFERENCE_2_SOURCE_PARAMETER_ID,
      SPEED_REFERENCE_3_SOURCE_PARAMETER_ID,
      SPEED_REFERENCE_4_SOURCE_PARAMETER_ID,
      POINTER_1_SOURCE_PARAMETER_ID,
      POINTER_1_SCALE_PARAMETER_ID,
      BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID,
      CLAMP_ZERO_REFERENCE_PARAMETER_ID,
      SPEED_REFERENCE_SOURCE_PARAMETER_ID
    ],
    []
  )

  useOnDemandParameters({
    deviceId,
    parameterIds: [...modeParameterIds, ...(selectedParameter ? [selectedParameter.id] : [])],
    limit: 5
  })

  const currentDriveMode = useMemo<DriveMode>(() => {
    const cf0 = Number(liveSnapshot[CF0_SOURCE_PARAMETER_ID])
    const cf1 = Number(liveSnapshot[CF1_SOURCE_PARAMETER_ID])
    const cf2 = Number(liveSnapshot[CF2_SOURCE_PARAMETER_ID])
    const cf4 = Number(liveSnapshot[CF4_SOURCE_PARAMETER_ID])
    const cf5 = Number(liveSnapshot[CF5_SOURCE_PARAMETER_ID])
    const cf6 = Number(liveSnapshot[CF6_SOURCE_PARAMETER_ID])
    const cf7 = Number(liveSnapshot[CF7_SOURCE_PARAMETER_ID])
    const cf116 = Number(liveSnapshot[CF116_SOURCE_PARAMETER_ID])
    const speedReference2Source = Number(liveSnapshot[SPEED_REFERENCE_2_SOURCE_PARAMETER_ID])
    const speedReference3Source = Number(liveSnapshot[SPEED_REFERENCE_3_SOURCE_PARAMETER_ID])
    const speedReference4Source = Number(liveSnapshot[SPEED_REFERENCE_4_SOURCE_PARAMETER_ID])
    const backupSpeedReferenceSource = Number(
      liveSnapshot[BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]
    )
    const clampZeroReference = Number(liveSnapshot[CLAMP_ZERO_REFERENCE_PARAMETER_ID])
    const pointer1Source = Number(liveSnapshot[POINTER_1_SOURCE_PARAMETER_ID])
    const pointer1Scale = Number(liveSnapshot[POINTER_1_SCALE_PARAMETER_ID])
    const speedReferenceSource = Number(liveSnapshot[SPEED_REFERENCE_SOURCE_PARAMETER_ID])

    if (
      cf0 === ETHERNET_MODE_VALUES[CF0_SOURCE_PARAMETER_ID] &&
      cf1 === ETHERNET_MODE_VALUES[CF1_SOURCE_PARAMETER_ID] &&
      cf2 === ETHERNET_MODE_VALUES[CF2_SOURCE_PARAMETER_ID] &&
      cf4 === ETHERNET_MODE_VALUES[CF4_SOURCE_PARAMETER_ID] &&
      cf5 === ETHERNET_MODE_VALUES[CF5_SOURCE_PARAMETER_ID] &&
      cf6 === ETHERNET_MODE_VALUES[CF6_SOURCE_PARAMETER_ID] &&
      cf7 === ETHERNET_MODE_VALUES[CF7_SOURCE_PARAMETER_ID] &&
      cf116 === ETHERNET_MODE_VALUES[CF116_SOURCE_PARAMETER_ID] &&
      Math.abs(pointer1Source - ETHERNET_POINTER_SOURCE_VALUE) < 0.01 &&
      Math.abs(pointer1Scale - ETHERNET_POINTER_SCALE_VALUE) < 0.01 &&
      clampZeroReference === ETHERNET_MODE_VALUES[CLAMP_ZERO_REFERENCE_PARAMETER_ID] &&
      speedReferenceSource === ETHERNET_SPEED_REFERENCE_SOURCE_VALUE
    ) {
      return 'ethernet'
    }

    if (
      cf0 === DIGITAL_INPUT_MODE_VALUES[CF0_SOURCE_PARAMETER_ID] &&
      cf1 === DIGITAL_INPUT_MODE_VALUES[CF1_SOURCE_PARAMETER_ID] &&
      cf2 === DIGITAL_INPUT_MODE_VALUES[CF2_SOURCE_PARAMETER_ID] &&
      cf4 === DIGITAL_INPUT_MODE_VALUES[CF4_SOURCE_PARAMETER_ID] &&
      cf5 === DIGITAL_INPUT_MODE_VALUES[CF5_SOURCE_PARAMETER_ID] &&
      cf6 === DIGITAL_INPUT_MODE_VALUES[CF6_SOURCE_PARAMETER_ID] &&
      cf7 === DIGITAL_INPUT_MODE_VALUES[CF7_SOURCE_PARAMETER_ID] &&
      cf116 === DIGITAL_INPUT_MODE_VALUES[CF116_SOURCE_PARAMETER_ID] &&
      speedReferenceSource ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_SOURCE_PARAMETER_ID] &&
      speedReference2Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_2_SOURCE_PARAMETER_ID] &&
      speedReference3Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_3_SOURCE_PARAMETER_ID] &&
      speedReference4Source ===
        DIGITAL_INPUT_REFERENCE_VALUES[SPEED_REFERENCE_4_SOURCE_PARAMETER_ID] &&
      backupSpeedReferenceSource ===
        DIGITAL_INPUT_REFERENCE_VALUES[BACKUP_SPEED_REFERENCE_SOURCE_PARAMETER_ID]
    ) {
      return 'digital-input'
    }

    return 'custom'
  }, [liveSnapshot])

  const isDriveCommandBusy = driveCommandInFlight !== null || modeChangeInFlight !== null
  const isEthernetMode = currentDriveMode === 'ethernet'

  useEffect(() => {
    if (!saveResult) return undefined
    const timer = setTimeout(() => setSaveResult(null), 4000)
    return () => clearTimeout(timer)
  }, [saveResult])

  useEffect(() => {
    if (!saveResult) return
    showNotice(saveResult, 4000)
  }, [saveResult, showNotice])

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

  const writeParameterOrThrow = async (
    targetDeviceId: DeviceId,
    parameterId: ParameterId,
    value: number,
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

  const writeWagoParameterOrThrow = async (
    parameterId: ParameterId,
    value: 0 | 1,
    errorMessage: string
  ) => {
    await writeParameterOrThrow(wagoId, parameterId, value, errorMessage)
  }

  const holdMomentaryWagoCommand = async (
    parameterId: ParameterId,
    holdMs: number,
    commandLabel: string
  ) => {
    const holdUntil = Date.now() + holdMs

    await writeWagoParameterOrThrow(parameterId, 0, `Failed to reset ${commandLabel}.`)
    await writeWagoParameterOrThrow(parameterId, 1, `Failed to send ${commandLabel}.`)

    while (Date.now() < holdUntil) {
      await delay(Math.min(WAGO_COMMAND_REFRESH_MS, holdUntil - Date.now()))
      if (Date.now() < holdUntil) {
        await writeWagoParameterOrThrow(parameterId, 1, `Failed to sustain ${commandLabel}.`)
      }
    }

    await writeWagoParameterOrThrow(parameterId, 0, `Failed to clear ${commandLabel}.`)
  }

  const writeEthernetControlWord = async (value: number) => {
    await writeParameterOrThrow(
      deviceId,
      ETHERNET_CONTROL_WORD_PARAMETER_ID,
      value,
      'Failed to write ConView Control word'
    )
  }

  const applyDriveMode = async (
    nextMode: Exclude<DriveMode, 'custom'>,
    values: Record<string, number>,
    successMessage: string
  ) => {
    if (isDriveCommandBusy) return

    setSaveResult(null)
    setModeChangeInFlight(nextMode)
    try {
      if (nextMode === 'ethernet') {
        await writeParameterOrThrow(
          deviceId,
          ETHERNET_REFERENCE_PARAMETER_ID,
          ETHERNET_REFERENCE_PRELOAD_VALUE,
          'Failed to preload ConView Control reference'
        )
        await writeParameterOrThrow(
          deviceId,
          ETHERNET_REFERENCE_FALLBACK_PARAMETER_ID,
          ETHERNET_REFERENCE_PRELOAD_VALUE,
          'Failed to preload ConView Control reference fallback'
        )
      }

      for (const [parameterId, value] of Object.entries(values)) {
        await writeParameterOrThrow(
          deviceId,
          parameterId as ParameterId,
          value,
          `Failed to set ${getDriveModeLabel(nextMode)}`
        )
      }

      setControlState((prev) => ({
        ...prev,
        mode: nextMode
      }))
      setSaveResult({ tone: 'success', message: successMessage })
    } catch (err) {
      const message =
        (err as Error)?.message || `Failed to switch to ${getDriveModeLabel(nextMode)}`
      setSaveResult({ tone: 'error', message })
    } finally {
      setModeChangeInFlight(null)
    }
  }

  const handleOpenQuickModal = () => {
    setSaveResult(null)
    setIsQuickModalOpen(true)
  }

  const handleSelectParameter = (param: DriveParameter) => {
    setSelectedParameter(param)
    setIsQuickModalOpen(false)
    setSaveResult(null)
  }

  const handleCloseParameterModal = () => {
    setSelectedParameter(null)
  }

  const handleSaveParameter = async (value: number) => {
    if (!selectedParameter) return

    const numericRange = selectedParameter.range_numeric
    if (numericRange) {
      const { min, max } = numericRange
      const belowMin = min !== undefined && value < min
      const aboveMax = max !== undefined && value > max
      if (belowMin || aboveMax) {
        const rangeMsg = `Out of range (${min ?? '-'} - ${max ?? '-'})`
        setSaveResult({ tone: 'error', message: rangeMsg })
        throw new Error(rangeMsg)
      }
    }

    setIsSavingParam(true)
    try {
      await writeParameterOrThrow(
        deviceId,
        selectedParameter.id as ParameterId,
        value,
        'Failed to write parameter'
      )
      setSaveResult({ tone: 'success', message: 'Value sent successfully' })
      setSelectedParameter(null)
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to write parameter'
      setSaveResult({ tone: 'error', message })
      throw err
    } finally {
      setIsSavingParam(false)
    }
  }

  const handleEstopReset = async () => {
    if (isEstopResetting || !isEstopPressed || !isWagoConnected || !isDriveConnected) return
    setSaveResult(null)
    setIsEstopResetting(true)

    try {
      const coilPulsePromise = holdMomentaryWagoCommand(
        ESTOP_RESET_PARAMETER_ID,
        WAGO_COMMAND_HOLD_MS,
        'E-stop reset'
      )

      const driveResetPromise = (async () => {
        await delay(ESTOP_RESET_DRIVE_RESET_DELAY_MS)
        const sent = await executeAction({
          deviceId,
          actionName: 'trip-reset-direct',
          parameters: { pulseMs: DRIVE_TRIP_RESET_PULSE_MS }
        })

        if (!sent) {
          throw new Error('Failed to trigger drive trip reset')
        }
      })()

      await Promise.all([coilPulsePromise, driveResetPromise])

      setSaveResult({ tone: 'success', message: 'E-stop reset sequence sent' })
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to trigger e-stop reset sequence'
      setSaveResult({ tone: 'error', message })
    } finally {
      setIsEstopResetting(false)
    }
  }

  const handleStartDrive = async () => {
    if (isDriveCommandBusy) return
    if (!isEthernetMode) {
      setSaveResult({
        tone: 'error',
        message: 'Switch to ConView Control to use HMI start/stop.'
      })
      return
    }
    setSaveResult(null)
    setDriveCommandInFlight('start')
    try {
      await writeEthernetControlWord(DRIVE_READY_WORD)
      await delay(DRIVE_COMMAND_PULSE_MS)
      // Hold the run bit high so the drive stays enabled after the start transition.
      await writeEthernetControlWord(DRIVE_START_WORD)

      setSaveResult({ tone: 'success', message: 'ConView Control start sequence sent' })
    } catch (err) {
      const message = (err as Error)?.message || 'Drive start failed'
      setSaveResult({ tone: 'error', message })
    } finally {
      setDriveCommandInFlight(null)
    }
  }

  const handleScaleFactorChange = async (scaleFactor: number) => {
    if (!selectedParameter) return

    await updateDriveParameterScaleFactor({
      deviceId,
      parameterId: selectedParameter.id,
      scaleFactor
    })

    setSelectedParameter((current) =>
      current ? { ...current, scale_factor: scaleFactor } : current
    )
  }

  const handleStopDrive = async () => {
    if (isDriveCommandBusy) return
    if (!isEthernetMode) {
      setSaveResult({
        tone: 'error',
        message: 'Switch to ConView Control to use HMI start/stop.'
      })
      return
    }
    setSaveResult(null)
    setDriveCommandInFlight('stop')
    try {
      await writeEthernetControlWord(DRIVE_STOP_WORD)
      setSaveResult({ tone: 'success', message: 'ConView Control stop command sent' })
    } catch (err) {
      const message = (err as Error)?.message || 'Drive stop failed'
      setSaveResult({ tone: 'error', message })
    } finally {
      setDriveCommandInFlight(null)
    }
  }

  const handleEmergencyStop = async () => {
    if (isDriveCommandBusy) return
    if (!isWagoConnected) {
      setSaveResult({
        tone: 'error',
        message: 'WAGO communication is required to use HMI emergency stop.'
      })
      return
    }
    setSaveResult(null)
    setDriveCommandInFlight('emergency-stop')
    try {
      const emergencyStopActions: Promise<unknown>[] = [
        holdMomentaryWagoCommand(
          EMERGENCY_STOP_PARAMETER_ID,
          WAGO_COMMAND_HOLD_MS,
          'main breaker open'
        )
      ]

      if (isEthernetMode && isDriveConnected) {
        emergencyStopActions.push(writeEthernetControlWord(DRIVE_RAPID_STOP_WORD))
      }

      await Promise.all(emergencyStopActions)

      setSaveResult({
        tone: 'success',
        message:
          isEthernetMode && isDriveConnected
            ? 'Emergency stop output and ConView Control rapid stop sent'
            : 'Emergency stop output sent to WAGO'
      })
    } catch (err) {
      const message = (err as Error)?.message || 'Emergency Stop failed'
      setSaveResult({ tone: 'error', message })
    } finally {
      setDriveCommandInFlight(null)
    }
  }

  return (
    <Panel {...positionProps}>
      <Card title="Drive Commands" icon={Settings} titleColor="#06b6d4">
        <DriveContent>
          <DriveStatusBox>
            <DriveStatusRow>
              <DriveLabel>STATE:</DriveLabel>
              <DriveState $active={controlState.driveRunning}>
                {controlState.driveRunning ? 'RUNNING' : 'STOPPED'}
              </DriveState>
            </DriveStatusRow>
            <DriveStatusRow>
              <DriveLabel>MODE:</DriveLabel>
              <DriveState $active={isEthernetMode}>
                {currentDriveMode === 'ethernet'
                  ? 'CONVIEW CONTROL'
                  : currentDriveMode === 'digital-input'
                    ? 'KEYPAD CONTROL'
                    : 'CUSTOM'}
              </DriveState>
            </DriveStatusRow>
            {controlState.driveFault && <DriveFaultBox>DRIVE FAULT!</DriveFaultBox>}
          </DriveStatusBox>

          <DriveControls>
            <ButtonGroup style={{ marginTop: 0, marginBottom: 8 }}>
              <ActionButton
                label={modeChangeInFlight === 'ethernet' ? 'SWITCHING...' : 'CONVIEW CONTROL'}
                color={isEthernetMode ? 'green' : 'slate'}
                active={isEthernetMode}
                disabled={isViewOnly || isDriveCommandBusy}
                onClick={() =>
                  applyDriveMode('ethernet', ETHERNET_MODE_VALUES, 'ConView Control applied')
                }
              />
              <ActionButton
                label={modeChangeInFlight === 'digital-input' ? 'SWITCHING...' : 'KEYPAD CONTROL'}
                color={currentDriveMode === 'digital-input' ? 'green' : 'slate'}
                active={currentDriveMode === 'digital-input'}
                disabled={isViewOnly || isDriveCommandBusy}
                onClick={() =>
                  applyDriveMode(
                    'digital-input',
                    { ...DIGITAL_INPUT_MODE_VALUES, ...DIGITAL_INPUT_REFERENCE_VALUES },
                    'Keypad Control applied'
                  )
                }
              />
            </ButtonGroup>

            <ActionButton
              label={driveCommandInFlight === 'start' ? 'STARTING...' : 'START DRIVE'}
              color="green"
              icon={Play}
              active={controlState.driveRunning}
              disabled={isViewOnly || isDriveCommandBusy || !isEthernetMode}
              onClick={handleStartDrive}
            />

            <ActionButton
              label={driveCommandInFlight === 'stop' ? 'STOPPING...' : 'STOP DRIVE'}
              color="red"
              icon={Square}
              disabled={isViewOnly || isDriveCommandBusy || !isEthernetMode}
              onClick={handleStopDrive}
            />

            <div style={{ height: '5px' }} />
          </DriveControls>

          <DriveKeypadSection>
            <DriveKeypad onClick={handleOpenQuickModal} />
          </DriveKeypadSection>

          <EmergencyStopContainer>
            <ActionButton
              label={isEstopPressed ? 'E-STOP PRESSED' : 'E-STOP OK'}
              color={isEstopPressed ? 'red' : 'green'}
              icon={isEstopPressed ? RefreshCcw : undefined}
              active={isEstopPressed || isEstopResetting}
              height="72px"
              disabled={
                isViewOnly ||
                isDriveCommandBusy ||
                isEstopResetting ||
                !isEstopPressed ||
                !isWagoConnected ||
                !isDriveConnected
              }
              onClick={handleEstopReset}
            />
            <div style={{ height: '12px' }} />
            <ActionButton
              label={driveCommandInFlight === 'emergency-stop' ? 'E-STOPPING...' : 'EMERGENCY STOP'}
              color="red"
              icon={AlertOctagon}
              height="72px"
              disabled={isViewOnly || isDriveCommandBusy || !isWagoConnected}
              onClick={handleEmergencyStop}
            />
          </EmergencyStopContainer>
        </DriveContent>
      </Card>
      <DriveParameterQuickModal
        isOpen={isQuickModalOpen}
        onClose={() => setIsQuickModalOpen(false)}
        onSelect={handleSelectParameter}
        deviceId={deviceId}
      />

      <ParameterDetailModal
        isOpen={!!selectedParameter}
        parameter={selectedParameter}
        liveValue={liveValue}
        onClose={handleCloseParameterModal}
        onSave={handleSaveParameter}
        onScaleFactorChange={handleScaleFactorChange}
        isSaving={isSavingParam}
        forceReadOnly={isViewOnly}
      />
    </Panel>
  )
}
