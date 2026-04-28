import styled from 'styled-components'

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
`

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 8px 10px;
  min-height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background:
    linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const InfoLabel = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const InfoValue = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1.05;
  word-break: break-word;
`

export const Tag = styled.span`
  grid-column: span 1;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.accent.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
`

export const SectionTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`

export const ExtrasList = styled.div<{ $dense?: boolean; $compact?: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ $dense }) => ($dense ? '8px' : '10px')};
  margin-top: 2px;
`

export const ExtraItem = styled.div<{ $compact?: boolean }>`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  align-items: center;
  padding: 8px;
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background.primary}40;
`

export const ExtraLabel = styled.span<{ $compact?: boolean }>`
  grid-column: span 1;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.3px;
`

export const ExtraValue = styled.span<{ $compact?: boolean }>`
  grid-column: span 3;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1.15;
  word-break: break-word;
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
  margin-top: auto;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px dashed rgba(130, 180, 255, 0.18);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  background: rgba(12, 22, 39, 0.58);
`

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(180deg, rgba(17, 28, 49, 0.98), rgba(12, 22, 39, 0.98));
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
`

export const ModalTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.05em;
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
  background: rgba(9, 17, 32, 0.92);
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.bodyFamily};
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
  flex-wrap: wrap;
`

export const SectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const SectionCaption = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.85;
`

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(12, 22, 39, 0.72);
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const CustomFieldsList = styled.div`
  display: grid;
  gap: 10px;
`

export const CustomFieldCard = styled.div`
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background:
    linear-gradient(180deg, rgba(17, 28, 49, 0.96) 0%, rgba(12, 22, 39, 0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const CustomFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`

export const CustomFieldTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const CustomFieldActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const CompactFieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

export const FieldHint = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.8;
`

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 12px;
  border: 1px dashed ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.primary}35;
`

export const EmptyTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const EmptyText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
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

export const RemoveButton = styled(SmallButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
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
