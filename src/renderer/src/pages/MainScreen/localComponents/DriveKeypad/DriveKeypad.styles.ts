import styled from 'styled-components'

type SizeProps = {
  $width?: string
  $height?: string
  $maxWidth?: string
  $maxHeight?: string
}

export const KeypadWrapper = styled.div<SizeProps>`
  width: ${({ $width }) => $width || '100%'};
  max-width: ${({ $maxWidth }) => $maxWidth || '360px'};
  height: ${({ $height }) => $height || 'auto'};
  max-height: ${({ $maxHeight }) => $maxHeight || 'none'};
  aspect-ratio: 420 / 740;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const KeypadSvg = styled.svg`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0px 20px 30px rgba(0, 0, 0, 0.4));
  transition: transform 0.1s ease;
`

