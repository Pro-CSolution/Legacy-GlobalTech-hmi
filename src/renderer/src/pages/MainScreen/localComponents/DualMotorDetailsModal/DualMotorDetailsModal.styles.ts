import styled from 'styled-components'

export const DualMotorDetailsGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 2 }) => $columns}, minmax(0, 1fr));
  gap: 18px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`

export const DualMotorDetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

export const DualMotorDetailsCard = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.gradients.card};
  box-shadow:
    ${({ theme }) => theme.shadows.md},
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
`

export const DualMotorDetailsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(140, 185, 255, 0.14);
`

export const DualMotorDetailsTitleWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

export const DualMotorDetailsTitle = styled.h4`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const DualMotorDetailsBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(103, 214, 255, 0.22);
  background: rgba(25, 39, 66, 0.86);
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const DualMotorInfoButton = styled.button`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 3px;
  padding: 8px 10px;
  min-height: 48px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background:
    linear-gradient(180deg, rgba(15, 25, 44, 0.98) 0%, rgba(10, 18, 33, 0.98) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(103, 214, 255, 0.26);
    background:
      linear-gradient(180deg, rgba(18, 31, 56, 0.98) 0%, rgba(11, 21, 39, 0.98) 100%);
  }
`

export const DualMotorCardHint = styled.div`
  margin-top: auto;
`

export const DualMotorSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`

export const DualMotorSectionHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const DualMotorSectionTitle = styled.h5`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const DualMotorSectionCaption = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.03em;
`
