import { X } from 'lucide-react'
import { ModalBase } from 'components/Modal'
import { PdfViewer } from 'components/PdfViewer'
import {
  ManualModalBody,
  ManualModalHeader,
  ManualModalTitle,
  ManualModalClose,
  ManualModalContent
} from './ManualModal.styles'

interface ManualModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title?: string
}

export const ManualModal = ({
  isOpen,
  onClose,
  fileUrl,
  title = 'Manual'
}: ManualModalProps) => {
  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onClose}
      width="100vw"
      height="100vh"
      maxWidth="100vw"
      maxHeight="100vh"
      borderRadius={0}
      ariaLabel={title}
    >
      <ManualModalBody>
        <ManualModalHeader>
          <ManualModalTitle>{title}</ManualModalTitle>
          <ManualModalClose onClick={onClose} aria-label="Close manual">
            <X size={22} />
          </ManualModalClose>
        </ManualModalHeader>
        <ManualModalContent>
          {isOpen && <PdfViewer fileUrl={fileUrl} initialPage={1} />}
        </ManualModalContent>
      </ManualModalBody>
    </ModalBase>
  )
}

