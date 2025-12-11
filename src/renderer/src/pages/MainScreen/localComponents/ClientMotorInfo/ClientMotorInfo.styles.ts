import styled from 'styled-components'

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 5px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.primary}60;
`

export const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.4px;
  text-transform: uppercase;
`

export const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const ExtrasList = styled.div<{ $dense?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $dense }) => ($dense ? '8px' : '10px')};
  margin-top: 4px;
`

export const ExtraItem = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  align-items: center;
  padding: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.primary}40;
`

export const Tag = styled.span`
  grid-column: span 1;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.3px;
`

export const ExtraLabel = styled.span`
  grid-column: span 1;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ExtraValue = styled.span`
  grid-column: span 3;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`

export const HintText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6px;
`

export const MoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  background: ${({ theme }) => theme.colors.background.primary}40;
`

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary}80;
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
`

export const ModalTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const ModalBody = styled.div`
  padding: 16px 18px 8px;
  overflow: auto;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const ModalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  h4 {
    margin: 0;
    font-size: ${({ theme }) => theme.typography.sizes.md};
    color: ${({ theme }) => theme.colors.text.primary};
    letter-spacing: 0.2px;
  }
`

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const FieldLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.3px;
`

export const FieldInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const FieldRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`

export const AddButton = styled.button`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.accent.primary};
  background: ${({ theme }) => theme.colors.accent.primary}20;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  transition: all 0.2s;
  min-width: 90px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accent.primary}35;
  }
`

export const SmallButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ $primary, theme }) =>
      $primary ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ $primary, theme }) =>
    $primary ? theme.colors.accent.primary : theme.colors.background.secondary};
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.text.inverse : theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const ModalFooter = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.primary}70;
  border-radius: 0 0 ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg};
`

export const FooterActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`
