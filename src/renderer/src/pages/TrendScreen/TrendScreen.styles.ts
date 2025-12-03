import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const ScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  padding: 10px;
  gap: 10px;
`

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.background.secondary}80; // 50% opacity
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 8px;
  flex-shrink: 0;
`

export const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

export const TimeButton = styled.button<{ isActive?: boolean }>`
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.colors.accent.primary : 'transparent'};
  color: ${({ isActive, theme }) => (isActive ? '#fff' : theme.colors.text.secondary)};
  border: 1px solid
    ${({ isActive, theme }) => (isActive ? theme.colors.accent.primary : 'transparent')};
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background-color: ${({ isActive, theme }) =>
      isActive ? theme.colors.accent.primary : theme.colors.background.tertiary};
  }
`

export const ActionButton = styled.button<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return theme.colors.accent.primary
      case 'success':
        return theme.colors.status.running
      case 'danger':
        return theme.colors.status.alarm
      default:
        return theme.colors.background.tertiary
    }
  }};
  color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;

  &:hover {
    filter: brightness(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const ContentArea = styled.div`
  display: flex;
  flex-grow: 1;
  gap: 12px;
  min-height: 0;
  position: relative;
`

export const ChartSection = styled.div<{ isShrunk?: boolean }>`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background.secondary}99;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 16px;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease-in-out;
  /* When shrunk, we add margin to the right to make space for the panel */
  margin-right: ${({ isShrunk }) => (isShrunk ? '320px' : '0')};
  position: relative;
`

export const LegendBox = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: ${({ theme }) => theme.colors.background.primary}E6; // 90% opacity
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 10;
  min-width: 180px;
  pointer-events: none; // Allow clicking through to chart if needed, usually better to allow interaction if buttons inside
`

export const LegendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
`

export const ReportPanel = styled.div<{ isOpen: boolean }>`
  width: 300px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(110%)')};
  transition: transform 0.3s ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 20;
  padding: 16px;
  gap: 16px;
`

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};

  h3 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

export const EmailList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.secondary};
`

export const EmailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  padding: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  button {
    color: ${({ theme }) => theme.colors.text.secondary};
    &:hover {
      color: ${({ theme }) => theme.colors.status.alarm};
    }
  }
`

export const InputGroup = styled.div`
  display: flex;
  gap: 4px;

  input {
    flex-grow: 1;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: 1px solid ${({ theme }) => theme.colors.borders.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 6px 10px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    outline: none;

    &:focus {
      border-color: ${({ theme }) => theme.colors.accent.primary};
    }
  }
`

// Modal Styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease-out;
`

export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 95%;
  max-width: 1200px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`

export const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`

export const ModalBody = styled.div`
  padding: 24px;
`

export const ModalFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  justify-content: flex-end;
  background-color: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
`

export const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
`

export const CategoryCard = styled.div`
  background-color: ${({ theme }) => theme.colors.background.primary}40;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 12px;
`

export const CategoryTitle = styled.h4`
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent.primary};
  margin: 0 0 12px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary}80;
`

export const VariableButton = styled.button<{ isSelected: boolean; isDisabled: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.accent.primary : theme.colors.borders.primary};
  background-color: ${({ isSelected, theme }) =>
    isSelected ? `${theme.colors.accent.primary}20` : theme.colors.background.secondary};
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
  transition: all 0.2s;

  &:hover {
    border-color: ${({ isDisabled, theme }) =>
      isDisabled ? theme.colors.borders.primary : theme.colors.accent.primary};
    background-color: ${({ isDisabled, isSelected, theme }) =>
      isDisabled
        ? 'transparent'
        : isSelected
          ? `${theme.colors.accent.primary}30`
          : theme.colors.background.tertiary};
  }

  span {
    font-size: 11px;
    font-weight: bold;
    color: ${({ isSelected, theme }) =>
      isSelected ? theme.colors.text.primary : theme.colors.text.secondary};
  }
`

export const ColorDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-left: auto;
`

export const CheckBox = styled.div<{ isSelected: boolean }>`
  width: 12px;
  height: 12px;
  border: 1px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.accent.primary : theme.colors.text.disabled};
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.accent.primary : 'transparent'};
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;

  svg {
    width: 10px;
    height: 10px;
    color: #fff;
  }
`
