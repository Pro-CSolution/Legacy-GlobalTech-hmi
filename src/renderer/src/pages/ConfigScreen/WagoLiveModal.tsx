import { X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { WagoLivePanel } from '../WagoLiveScreen'
import * as S from './WagoLiveModal.styles'

type WagoLiveModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const WagoLiveModal = ({ isOpen, onClose }: WagoLiveModalProps) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      width="100vw"
      height="100vh"
      maxWidth="100vw"
      maxHeight="100vh"
      borderRadius={0}
      ariaLabel="WAGO live inputs"
    >
      <S.Body>
        <S.CloseButton onClick={onClose} aria-label="Close WAGO live inputs">
          <X size={20} />
        </S.CloseButton>

        <S.PanelShell>{isOpen ? <WagoLivePanel embedded active={isOpen} /> : null}</S.PanelShell>
      </S.Body>
    </ModalBase>
  )
}
