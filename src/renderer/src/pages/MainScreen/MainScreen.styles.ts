import styled from 'styled-components'

export const MainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const StatusList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const WarningGroup = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  margin-top: 4px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const ElectricalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  height: 100%;
`

export const GaugeTile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: 100%;
  min-height: 0;
`

export const GaugeLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-align: center;
  letter-spacing: 0.5px;
`

export const TrendPlaceholder = styled.div`
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

export const TrendLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const TrendStatus = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.status.alarm};
`

export const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`

export const SliderContainer = styled.div`
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

export const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  margin-bottom: 16px;
`

export const SliderLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`

export const SliderValue = styled.span`
  font-family: 'Roboto Mono', monospace;
  font-size: 60px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.accent.primary};
`

export const RangeInput = styled.input`
  width: 100%;
  height: 16px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: 8px;
  appearance: none;
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 32px;
    height: 32px;
    background: ${({ theme }) => theme.colors.accent.primary};
    border: 4px solid ${({ theme }) => theme.colors.background.secondary};
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }
`

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: 70px;
  margin-top: 30px;
  gap: 12px;
`

export const AdjustmentButton = styled.button`
  flex: 1;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: ${({ theme }) => theme.typography.sizes.xl};

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
    border-color: ${({ theme }) => theme.colors.text.secondary};
  }
`

export const DriveStatusBox = styled.div`
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
  margin-bottom: 24px;
`

export const DriveStatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

export const DriveLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const DriveState = styled.span<{ $active: boolean }>`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.status.running : theme.colors.background.tertiary};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.text.inverse : theme.colors.text.primary};
`

export const DriveFaultBox = styled.div`
  margin-top: 8px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.status.alarm}20;
  border: 1px solid ${({ theme }) => theme.colors.status.alarm};
  color: ${({ theme }) => theme.colors.status.alarm};
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  border-radius: 4px;
`

export const DriveControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const DriveContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const DriveKeypadSection = styled.div`
  display: flex;
  justify-content: center;
  padding: 5px 0;
  height: 460px;
  cursor: pointer;
`

export const EmergencyStopContainer = styled.div`
  margin-top: auto;
  padding-top: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
`
