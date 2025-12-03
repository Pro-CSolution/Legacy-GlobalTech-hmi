import styled from 'styled-components'

export const Centerer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
`

export const Canvas = styled.div<{ width: number; height: number; scale: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  position: relative;
  background: ${({ theme }) => theme.colors.background.secondary};
  overflow: hidden;
  transform: scale(${({ scale }) => scale});
  transform-origin: center; /* Center scaling looks better with flex center parent */
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`
