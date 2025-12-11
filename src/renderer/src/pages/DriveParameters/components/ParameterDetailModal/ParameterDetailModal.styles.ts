import styled from 'styled-components'

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px;
`

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  padding-bottom: 16px;
`

export const ModalTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ModalSubtitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const StatusBadge = styled.div<{ $tone?: 'warning' | 'success' | 'info' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  color: ${({ theme, $tone }) => {
    if ($tone === 'warning') return theme.colors.status.alarm
    if ($tone === 'success') return theme.colors.status.running
    return theme.colors.accent.primary
  }};

  background: ${({ theme, $tone }) => {
    if ($tone === 'warning') return `${theme.colors.status.alarm}22`
    if ($tone === 'success') return `${theme.colors.status.running}22`
    return `${theme.colors.accent.primary}22`
  }};

  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'warning') return `${theme.colors.status.alarm}44`
      if ($tone === 'success') return `${theme.colors.status.running}44`
      return `${theme.colors.accent.primary}44`
    }};
`

export const ModalBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ValueDisplay = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 8px 0;
`

export const LargeValue = styled.div`
  font-size: 3rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
  font-family: monospace;
`

export const DescriptionBox = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  padding: 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  line-height: 1.5;
`

export const AttributeList = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

export const AttributeTag = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const EditArea = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const OptionArea = styled.div`
  margin-top: 8px;
  padding: 12px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const OptionList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr));
  grid-auto-rows: minmax(56px, auto);
  grid-auto-flow: row;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
`

export const OptionButton = styled.button<{ $active?: boolean }>`
  padding: 8px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary + '22' : theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  text-align: left;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  min-width: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const FakeInput = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 12px;
  text-align: left;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  cursor: pointer;
  transition: all 0.2s;

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
        background: ${theme.colors.accent.primary};
        color: ${theme.colors.text.inverse};
        border: none;
        &:hover { filter: brightness(1.1); }
        &:disabled { background: ${theme.colors.background.tertiary}; color: ${theme.colors.text.secondary}; }
      `
      : `
        background: transparent;
        color: ${theme.colors.text.primary};
        border: 1px solid ${theme.colors.borders.primary};
        &:hover { background: ${theme.colors.background.tertiary}; }
      `}
`
