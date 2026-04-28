import { useEffect, useState } from 'react'
import { ScreenLayout } from 'layouts'
import {
  Power,
  RefreshCw,
  BookOpen,
  AppWindow,
  MonitorUp,
  Network,
  Clock3,
  LayoutGrid,
  Cpu
} from 'lucide-react'
import { ManualModal } from 'components/ManualModal'
import { HoldConfirmModal } from 'components/HoldConfirmModal'
import { AnnouncementModal } from 'components/Modal'
import {
  getMotorControlModeLabel,
  useMotorControlModePreference,
  usePreferredSingleMotorScope,
  usePreferredSingleMotorScopePreference,
  type MotorControlMode
} from 'hooks'
import { useNavigate, useSearchParams } from 'react-router'
import { rebootSystem, refreshComms, type SystemTimeZoneConfig } from 'services'
import { getMotorScopeLabel } from 'utils/motorDeviceMapping'
import driveManualPdfUrl from 'assets/manual/T1679EN Software Manual Rev 07.pdf?url'
import { DeviceConfigModal } from './DeviceConfigModal'
import { MotorControlModeModal } from './MotorControlModeModal'
import { TimeZoneModal } from './TimeZoneModal'
import { WagoLiveModal } from './WagoLiveModal'
import {
  ConfigContainer,
  Title,
  Grid,
  ConfigCard,
  CardIcon,
  CardLabel,
  CardDescription
} from './ConfigScreen.styles'

const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  const maybeAxios = error as {
    message?: string
    response?: { status?: number; data?: { detail?: unknown } }
  }

  const detail = maybeAxios.response?.data?.detail
  const message =
    typeof detail === 'string'
      ? detail
      : typeof maybeAxios.message === 'string'
        ? maybeAxios.message
        : fallback

  return maybeAxios.response?.status ? `HTTP ${maybeAxios.response.status} - ${message}` : message
}

const ConfigScreen = () => {
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isRebootOpen, setIsRebootOpen] = useState(false)
  const [isDeviceConfigOpen, setIsDeviceConfigOpen] = useState(false)
  const [isTimeZoneOpen, setIsTimeZoneOpen] = useState(false)
  const [isMotorControlModeOpen, setIsMotorControlModeOpen] = useState(false)
  const [isWagoMonitorOpen, setIsWagoMonitorOpen] = useState(false)
  const [isRefreshingComms, setIsRefreshingComms] = useState(false)
  const [motorControlMode, setMotorControlMode] = useMotorControlModePreference()
  const effectiveSingleMotorScope = usePreferredSingleMotorScope()
  const [storedSingleMotorScope, setStoredSingleMotorScope] =
    usePreferredSingleMotorScopePreference()
  const [announcementModal, setAnnouncementModal] = useState<{
    open: boolean
    title: string
    message: string
  }>({
    open: false,
    title: 'Notice',
    message: ''
  })
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')
  const currentSingleMotorScope = storedSingleMotorScope ?? effectiveSingleMotorScope

  useEffect(() => {
    if (requestedSection !== 'wago') {
      return
    }

    setIsWagoMonitorOpen(true)
    navigate('/config', { replace: true })
  }, [navigate, requestedSection])

  const handleRestartApp = () => {
    // You want a "reload" of the renderer, but always landing on MAIN.
    navigate('/')
    // HashRouter: asegurar que el hash sea #/ antes del reload.
    window.location.hash = '#/'
    window.setTimeout(() => {
      window.location.reload()
    }, 30)
  }

  const handleRestartPC = () => {
    setIsRebootOpen(true)
  }

  const handleRefreshComms = () => {
    if (isRefreshingComms) return

    setIsRefreshingComms(true)
    void refreshComms()
      .then((result) => {
        setAnnouncementModal({
          open: true,
          title: 'Comms refreshed',
          message: `Rebuilt communications for ${result.device_count} device${result.device_count === 1 ? '' : 's'}. The PLC and WAGO polling will reconnect on the next scan.`
        })
      })
      .catch((err: unknown) => {
        const message = getRequestErrorMessage(err, 'Failed to refresh communications.')

        setAnnouncementModal({
          open: true,
          title: 'Refresh comms failed',
          message
        })
      })
      .finally(() => {
        setIsRefreshingComms(false)
      })
  }

  const handleOpenManual = () => {
    setIsManualOpen(true)
  }

  const handleOpenDeviceConfig = () => {
    setIsDeviceConfigOpen(true)
  }

  const handleOpenTimeZone = () => {
    setIsTimeZoneOpen(true)
  }

  const handleOpenMotorControlMode = () => {
    setIsMotorControlModeOpen(true)
  }

  const handleOpenWagoMonitor = () => {
    setIsWagoMonitorOpen(true)
  }

  const handleCloseWagoMonitor = () => {
    setIsWagoMonitorOpen(false)
  }

  const handleSaveMotorControlMode = (nextMode: MotorControlMode, nextScope: 1 | 2) => {
    setMotorControlMode(nextMode)
    if (nextMode === 'single') {
      setStoredSingleMotorScope(nextScope)
    }
    setIsMotorControlModeOpen(false)
    setAnnouncementModal({
      open: true,
      title: 'Motor control mode updated',
      message:
        nextMode === 'single'
          ? `The HMI interface is now set to 1 motor monitoring for ${getMotorScopeLabel(nextScope)}.`
          : `The HMI interface is now set to ${getMotorControlModeLabel(nextMode).toLowerCase()}.`
    })
  }

  const handleOpenRustDesk = () => {
    const api = window.api
    if (!api?.openRustDesk) {
      setAnnouncementModal({
        open: true,
        title: 'RustDesk',
        message: 'Not available outside of Electron (API not found).'
      })
      return
    }

    void api.openRustDesk().catch((err: unknown) => {
      const e = err as { message?: string }
      setAnnouncementModal({
        open: true,
        title: 'RustDesk',
        message: e?.message || 'Failed to open RustDesk.'
      })
    })
  }

  const handleConfirmReboot = () => {
    setIsRebootOpen(false)
    // No feedback UI: trigger the request and done.
    void rebootSystem().catch((err: unknown) => {
      const message = getRequestErrorMessage(err, 'Failed to restart the system.')

      setAnnouncementModal({
        open: true,
        title: 'Reboot failed',
        message
      })
    })
  }

  return (
    <ScreenLayout>
      <ConfigContainer>
        <Title>System Configuration</Title>
        <Grid>
          <ConfigCard onClick={handleRestartApp}>
            <CardIcon>
              <AppWindow size={48} />
            </CardIcon>
            <CardLabel>Restart Application</CardLabel>
            <CardDescription>Reloads the HMI application interface.</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleRefreshComms} disabled={isRefreshingComms}>
            <CardIcon>
              <RefreshCw size={48} />
            </CardIcon>
            <CardLabel>{isRefreshingComms ? 'Refreshing Comms...' : 'Refresh Comms'}</CardLabel>
            <CardDescription>
              Reconnects PLC and WAGO communications without restarting the computer.
            </CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleRestartPC}>
            <CardIcon>
              <Power size={48} />
            </CardIcon>
            <CardLabel>Reboot System</CardLabel>
            <CardDescription>Restarts the industrial PC.</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenManual}>
            <CardIcon>
              <BookOpen size={48} />
            </CardIcon>
            <CardLabel>Drive Manual</CardLabel>
            <CardDescription>View the T1679EN Software Manual (PDF).</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenDeviceConfig}>
            <CardIcon>
              <Network size={48} />
            </CardIcon>
            <CardLabel>Device Network</CardLabel>
            <CardDescription>Edit device IP, port and display name.</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenTimeZone}>
            <CardIcon>
              <Clock3 size={48} />
            </CardIcon>
            <CardLabel>Time Zone</CardLabel>
            <CardDescription>Switch between the four supported U.S. time zones.</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenMotorControlMode}>
            <CardIcon>
              <LayoutGrid size={48} />
            </CardIcon>
            <CardLabel>Motor Control Mode</CardLabel>
            <CardDescription>
              Current interface:{' '}
              {motorControlMode === 'single'
                ? `${getMotorControlModeLabel(motorControlMode)} (${getMotorScopeLabel(currentSingleMotorScope)})`
                : getMotorControlModeLabel(motorControlMode)}
              . Tap to choose 1 or 2 motors.
            </CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenWagoMonitor}>
            <CardIcon>
              <Cpu size={48} />
            </CardIcon>
            <CardLabel>WAGO Live Inputs</CardLabel>
            <CardDescription>Open the live WAGO analog monitor in a popup window.</CardDescription>
          </ConfigCard>

          <ConfigCard onClick={handleOpenRustDesk}>
            <CardIcon>
              <MonitorUp size={48} />
            </CardIcon>
            <CardLabel>Remote Support</CardLabel>
            <CardDescription>Open RustDesk for remote monitoring.</CardDescription>
          </ConfigCard>
        </Grid>
      </ConfigContainer>

      <ManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        fileUrl={driveManualPdfUrl}
        title="Drive Software Manual"
      />

      <HoldConfirmModal
        isOpen={isRebootOpen}
        onCancel={() => setIsRebootOpen(false)}
        onConfirm={handleConfirmReboot}
        tone="danger"
        title="Reboot System"
        message="This will restart the industrial PC immediately. Use only if required."
        hint="Hold to reboot the system."
        holdLabel="HOLD TO REBOOT"
        holdTimeMs={1600}
      />

      <DeviceConfigModal
        isOpen={isDeviceConfigOpen}
        motorControlMode={motorControlMode}
        onClose={() => setIsDeviceConfigOpen(false)}
        onSaved={(device) => {
          setAnnouncementModal({
            open: true,
            title: 'Device updated',
            message: `${device.name} (${device.id}) saved with ${device.host}:${device.port}.`
          })
        }}
      />

      <TimeZoneModal
        isOpen={isTimeZoneOpen}
        onClose={() => setIsTimeZoneOpen(false)}
        onSaved={(config: SystemTimeZoneConfig) => {
          setAnnouncementModal({
            open: true,
            title: 'Time zone updated',
            message: `System time zone changed to ${config.currentTimeZoneLabel}.`
          })
        }}
      />

      <MotorControlModeModal
        isOpen={isMotorControlModeOpen}
        currentMode={motorControlMode}
        currentSingleMotorScope={currentSingleMotorScope}
        onClose={() => setIsMotorControlModeOpen(false)}
        onSave={handleSaveMotorControlMode}
      />

      <WagoLiveModal isOpen={isWagoMonitorOpen} onClose={handleCloseWagoMonitor} />

      <AnnouncementModal
        isOpen={announcementModal.open}
        title={announcementModal.title}
        message={announcementModal.message}
        actionLabel="OK"
        onClose={() => setAnnouncementModal((previous) => ({ ...previous, open: false }))}
      />
    </ScreenLayout>
  )
}

export default ConfigScreen
