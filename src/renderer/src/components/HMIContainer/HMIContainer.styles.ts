import styled, { css } from 'styled-components'

export const Centerer = styled.div<{ $scrollable?: boolean; $alignTop?: boolean }>`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: ${({ $alignTop }) => ($alignTop ? 'flex-start' : 'center')};
  justify-content: ${({ $alignTop }) => ($alignTop ? 'flex-start' : 'center')};
  background:
    radial-gradient(circle at top center, rgba(53, 101, 205, 0.14), transparent 30%),
    radial-gradient(circle at bottom left, rgba(72, 191, 255, 0.08), transparent 32%),
    ${({ theme }) => theme.colors.background.primary};
  overflow: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
  position: fixed;
  top: 0;
  left: 0;
`

export const Canvas = styled.div<{
  width: number
  height: number
  scale: number
  $useZoom: boolean
}>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
  background:
    radial-gradient(circle at top center, rgba(53, 101, 205, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(15, 26, 46, 0.98) 0%, rgba(10, 20, 36, 0.98) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: 22px;
  overflow: hidden;
  ${({ $useZoom, scale }) =>
    $useZoom
      ? css`
          /* Prefer zoom to keep pointer math consistent for canvas libs (e.g. uPlot). */
          zoom: ${scale};
        `
      : css`
          transform: scale(${scale});
          transform-origin: center; /* Center scaling looks better with flex center parent */
        `}
  flex-shrink: 0;
  box-shadow:
    ${({ theme }) => theme.shadows.lg},
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
`

export const FluidCanvas = styled.div`
  width: 100%;
  min-height: max(100%, 100dvh);
  position: relative;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top center, rgba(53, 101, 205, 0.1), transparent 24%),
    linear-gradient(180deg, rgba(15, 26, 46, 0.98) 0%, rgba(10, 20, 36, 0.98) 100%);
  overflow: visible;
  flex-shrink: 0;
`
