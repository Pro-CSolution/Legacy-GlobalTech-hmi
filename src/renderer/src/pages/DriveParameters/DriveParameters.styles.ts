import styled from 'styled-components'

export const PageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

export const Sidebar = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 420px;
  padding: 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ContentArea = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 440px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const SearchRow = styled.div`
  display: flex;
  gap: 8px;
`

export const SearchInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};

  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.accent.primary};
  }
`

export const MenuListWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden; /* Hide scrollbar */
`

export const MenuList = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: scroll;
  padding-right: 4px;

  /* Hide scrollbar for standard browsers */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`

export const MenuItem = styled.button<{ $active?: boolean }>`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary + '22' : theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 14px 10px; /* Larger touch target */
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.background.primary};
  }
`

export const MenuName = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  text-align: left;
`

export const MenuBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const ScrollControls = styled.div`
  display: flex;
  gap: 12px;
  height: 60px;
`

export const ScrollButton = styled.button`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:active {
    background: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.inverse};
  }
`

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.5px;
`

export const Meta = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
`

export const CardsArea = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr); /* Force 3 rows */
  gap: 12px;
  padding: 4px;
  overflow: hidden;
`

export const Card = styled.button<{ $readonly?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition:
    transform 0.1s ease,
    border-color 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }

  opacity: ${({ $readonly }) => ($readonly ? 0.9 : 1)};
`

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`

export const CardName = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin-bottom: 2px;

  display: flex;
  align-items: baseline;
  gap: 8px;
`

export const CardId = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: normal;
`

export const ValueRow = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`

export const Value = styled.span`
  font-size: 2.3rem;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.accent.primary};
`

export const Unit = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
`

export const SubLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`

export const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
  gap: 8px;
`

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`

export const BadgeRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`

export const Badge = styled.span<{ $tone?: 'info' | 'warning' }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme, $tone }) =>
    $tone === 'warning' ? theme.colors.status.alarm : theme.colors.accent.primary};
  background: ${({ theme, $tone }) =>
    $tone === 'warning' ? `${theme.colors.status.alarm}26` : `${theme.colors.accent.primary}26`};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === 'warning' ? `${theme.colors.status.alarm}66` : theme.colors.accent.primary};
`

export const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`

export const PageControls = styled.div`
  display: flex;
  gap: 8px;
`

export const PageButton = styled.button`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  min-width: 80px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
