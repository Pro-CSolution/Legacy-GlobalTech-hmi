import styled from 'styled-components'

export const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
`

export const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(9, 17, 32, 0.92);
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.md};

  &:hover {
    border-color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`

export const PanelShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-right: 64px;
`
