import { useState } from 'react'
import { ScreenLayout } from 'layouts'
import { Power, RefreshCw, BookOpen, MonitorUp } from 'lucide-react'
import { ManualModal } from 'components/ManualModal'
import { HoldConfirmModal } from 'components/HoldConfirmModal'
import { AnnouncementModal } from 'components/Modal'
import { useNavigate } from 'react-router'
import { rebootSystem } from 'services'
import driveManualPdfUrl from 'assets/manual/T1679EN Software Manual Rev 07.pdf?url'
import {
  ConfigContainer,
  Title,
  Grid,
  ConfigCard,
  CardIcon,
  CardLabel,
  CardDescription
} from './ConfigScreen.styles'

const ConfigScreen = () => {
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [isRebootOpen, setIsRebootOpen] = useState(false)
  const [errorModal, setErrorModal] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: 'Error',
    message: ''
  })
  const navigate = useNavigate()

  const handleRestartApp = () => {
    // Querés un "reload" del renderer, pero aterrizando siempre en MAIN.
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

  const handleOpenManual = () => {
    setIsManualOpen(true)
  }

  const handleOpenRustDesk = () => {
    const api = window.api
    if (!api?.openRustDesk) {
      setErrorModal({
        open: true,
        title: 'RustDesk',
        message: 'No está disponible fuera de Electron (API no encontrada).'
      })
      return
    }

    void api.openRustDesk().catch((err: unknown) => {
      const e = err as { message?: string }
      setErrorModal({
        open: true,
        title: 'RustDesk',
        message: e?.message || 'No se pudo abrir RustDesk.'
      })
    })
  }

  const handleConfirmReboot = () => {
    setIsRebootOpen(false)
    // No feedback UI: dispara el request y listo.
    void rebootSystem().catch((err: unknown) => {
      // Mostrar motivo si falla
      const maybeAxios = err as {
        message?: string
        response?: { status?: number; data?: { detail?: unknown } }
      }

      const status = maybeAxios.response?.status
      const detail = maybeAxios.response?.data?.detail
      const msg =
        typeof detail === 'string'
          ? detail
          : typeof maybeAxios.message === 'string'
            ? maybeAxios.message
            : 'No se pudo reiniciar el sistema.'

      const message = status ? `HTTP ${status} · ${msg}` : msg

      setErrorModal({
        open: true,
        title: 'Reboot falló',
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
              <RefreshCw size={48} />
            </CardIcon>
            <CardLabel>Restart Application</CardLabel>
            <CardDescription>Reloads the HMI application interface.</CardDescription>
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

      <AnnouncementModal
        isOpen={errorModal.open}
        title={errorModal.title}
        message={errorModal.message}
        actionLabel="OK"
        onClose={() => setErrorModal((p) => ({ ...p, open: false }))}
      />
    </ScreenLayout>
  )
}

export default ConfigScreen
