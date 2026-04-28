import ReactModal from 'react-modal'
import styled from 'styled-components'

type ModalBaseProps = {
  isOpen: boolean
  onRequestClose: () => void
  children: React.ReactNode
  width?: number | string
  height?: number | string
  maxWidth?: number | string
  maxHeight?: number | string
  borderRadius?: number | string
  ariaLabel?: string
}

// Ensure accessibility target
if (typeof document !== 'undefined') {
  ReactModal.setAppElement('#root')
}

const toCssSize = (value?: number | string, fallback?: string) => {
  if (typeof value === 'number') return `${value}px`
  return value ?? fallback
}

const Content = styled.div<{
  $width?: number | string
  $height?: number | string
  $maxWidth?: number | string
  $maxHeight?: number | string
  $borderRadius?: number | string
}>`
  box-sizing: border-box;
  background: #0b1324;
  border: 1px solid #1f2937;
  border-radius: ${({ theme, $borderRadius }) =>
    typeof $borderRadius === 'number'
      ? `${$borderRadius}px`
      : $borderRadius ?? theme.borderRadius.lg};
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.45),
    ${({ theme }) => theme.shadows.lg};
  width: ${({ $width }) => toCssSize($width, '520px')};
  height: ${({ $height }) => toCssSize($height, 'auto')};
  max-width: ${({ $maxWidth }) => toCssSize($maxWidth, '90vw')};
  max-height: ${({ $maxHeight }) => toCssSize($maxHeight, '90vh')};
  overflow: hidden;
`

export const ModalBase = ({
  isOpen,
  onRequestClose,
  children,
  width,
  height,
  maxWidth,
  maxHeight,
  borderRadius,
  ariaLabel = 'Modal'
}: ModalBaseProps) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      ariaHideApp={false}
      contentLabel={ariaLabel}
      style={{
        overlay: {
          background: 'rgba(15, 23, 42, 0.85)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)'
        },
        content: { inset: 'auto', border: 'none', background: 'transparent', padding: 0 }
      }}
      contentElement={(modalProps, childrenEl) => {
        // Avoid passing modal inline styles that force transparent background
        // Only forward essential props (className, id, etc.)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { style, ...rest } = modalProps
        return (
          <Content
            {...rest}
            $width={width}
            $height={height}
            $maxWidth={maxWidth}
            $maxHeight={maxHeight}
            $borderRadius={borderRadius}
          >
            {childrenEl}
          </Content>
        )
      }}
    >
      {children}
    </ReactModal>
  )
}
