import { useEffect, useState } from 'react'
import {
  Settings,
  Play,
  Square,
  RefreshCcw,
  AlertOctagon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
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
  InlineStatus
} from '../MainScreen.styles'
import { PositionProps } from 'styles/mixins'
import { useSendCommand } from 'hooks'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { useRealtime } from 'hooks/useRealtime'
import { DriveParameter } from 'types/drive'
import { DeviceId, ParameterId } from 'types'
import { ParameterDetailModal } from '../../DriveParameters/components/ParameterDetailModal/ParameterDetailModal'

interface DriveControlProps extends PositionProps {
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
      vfdCoolant: string
      blower: string
      motorTempWarn: string
      motorTempHigh: string
    }>
  >
}

export const DriveControl = ({
  controlState,
  setControlState,
  ...positionProps
}: DriveControlProps) => {
  const deviceId: DeviceId = 'drive_avid'

  const { writeParameter } = useSendCommand()
  const { devicesData, subscribeDevice, unsubscribeDevice } = useRealtime()

  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false)
  const [selectedParameter, setSelectedParameter] = useState<DriveParameter | null>(null)
  const [isSavingParam, setIsSavingParam] = useState(false)
  const [isTripResetting, setIsTripResetting] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    subscribeDevice(deviceId)
    return () => unsubscribeDevice(deviceId)
  }, [deviceId, subscribeDevice, unsubscribeDevice])

  useOnDemandParameters({
    deviceId,
    parameterIds: selectedParameter ? [selectedParameter.id] : [],
    limit: 1
  })

  const liveSnapshot = devicesData[deviceId] || {}
  const liveValue = selectedParameter ? liveSnapshot[selectedParameter.id] : undefined

  useEffect(() => {
    if (!saveResult) return undefined
    const timer = setTimeout(() => setSaveResult(null), 4000)
    return () => clearTimeout(timer)
  }, [saveResult])

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
      await writeParameter({
        deviceId,
        parameterId: selectedParameter.id as ParameterId,
        value
      })
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

  const handleTripReset = async () => {
    if (isTripResetting) return
    setSaveResult(null)
    setIsTripResetting(true)
    try {
      const wroteHigh = await writeParameter({
        deviceId,
        parameterId: 'P10.34',
        value: 1
      })
      if (!wroteHigh) throw new Error('Failed to trigger trip reset')

      await new Promise<void>((resolve) => setTimeout(resolve, 500))

      await writeParameter({
        deviceId,
        parameterId: 'P10.34',
        value: 0
      })

      setSaveResult({ tone: 'success', message: 'Trip reset pulse sent' })
    } catch (err) {
      const message = (err as Error)?.message || 'Trip reset failed'
      setSaveResult({ tone: 'error', message })
    } finally {
      // Small cooldown to prevent double taps
      setTimeout(() => setIsTripResetting(false), 500)
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
            {controlState.driveFault && <DriveFaultBox>DRIVE FAULT!</DriveFaultBox>}
          </DriveStatusBox>

          <DriveControls>
            <ActionButton
              label="START DRIVE"
              color="green"
              icon={Play}
              active={controlState.driveRunning}
              onClick={() =>
                setControlState((p) => ({ ...p, driveRunning: true, driveFault: false }))
              }
            />

            <ActionButton
              label="STOP DRIVE"
              color="red"
              icon={Square}
              onClick={() => setControlState((p) => ({ ...p, driveRunning: false }))}
            />

            <div style={{ height: '5px' }} />
          </DriveControls>

          <DriveKeypadSection>
            <DriveKeypad onClick={handleOpenQuickModal} />
          </DriveKeypadSection>

          <EmergencyStopContainer>
            <ActionButton
              label={isTripResetting ? 'TRIP RESETTING...' : 'TRIP RESET'}
              color="yellow"
              icon={RefreshCcw}
              height="72px"
              disabled={isTripResetting}
              onClick={handleTripReset}
            />
            <div style={{ height: '12px' }} />
            <ActionButton label="EMERGENCY STOP" color="red" icon={AlertOctagon} height="72px" />
          </EmergencyStopContainer>
        </DriveContent>
      </Card>

      {saveResult && (
        <InlineStatus $tone={saveResult.tone}>
          {saveResult.tone === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{saveResult.message}</span>
        </InlineStatus>
      )}

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
        isSaving={isSavingParam}
      />
    </Panel>
  )
}
