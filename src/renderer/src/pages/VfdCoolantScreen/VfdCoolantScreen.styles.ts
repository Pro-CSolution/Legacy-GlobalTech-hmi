import styled from 'styled-components'

export const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr 280px;
  gap: 20px;
  height: 100%;
  padding: 20px;
  width: 100%;
`

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
`

export const CenterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`

export const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const GaugesContainer = styled.div`
  display: flex;
  gap: 20px;
  height: 100%;
  justify-content: center;
`

export const ChartContainer = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  position: relative;
  overflow: hidden;
  padding: 16px;
  display: flex;
  flex-direction: column;
`
