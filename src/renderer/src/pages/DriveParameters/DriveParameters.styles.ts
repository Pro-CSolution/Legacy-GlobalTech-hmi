import styled from 'styled-components'

export const PageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;

  @media (max-width: 960px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: auto;
    min-height: 100%;
  }
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

  @media (max-width: 960px) {
    position: static;
    width: 100%;
    min-height: 280px;
  }

  @media (max-width: 640px) {
    min-height: 240px;
    padding: 12px;
  }
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

  @media (max-width: 960px) {
    position: static;
    inset: auto;
  }
`

export const MobileMenuToolbar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid ${({ theme }) => theme.colors.borders.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.background.secondary};
  }
`

export const MobileMenuSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

export const MobileMenuLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const MobileMenuValue = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
`

export const MenuPickerButton = styled.button`
  min-width: 142px;
  min-height: 48px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const SearchRow = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    flex-wrap: wrap;
  }
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
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
  }
`

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: max-content;
  flex-shrink: 0;
`

export const HeaderRightLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  white-space: normal;
  text-transform: none;
  opacity: 1;

  @media (max-width: 960px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`

export const HeaderCenterControls = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: inline-flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;

  @media (max-width: 960px) {
    position: static;
    left: auto;
    top: auto;
    transform: none;
    justify-content: flex-start;
  }
`

export const HeaderRightInfo = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 960px) {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
`

export const HeaderMotorSelector = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 5px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: rgba(13, 23, 48, 0.86);
  box-shadow: ${({ theme }) => theme.shadows.sm};

  @media (max-width: 640px) {
    width: 100%;
    justify-content: stretch;
  }
`

export const HeaderMotorButton = styled.button<{ $active: boolean }>`
  min-width: 164px;
  height: 40px;
  padding: 0 20px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}cc` : `${theme.colors.borders.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background:
    radial-gradient(
      circle at top center,
      ${({ $active }) => ($active ? 'rgba(122, 223, 255, 0.18)' : 'transparent')} 0%,
      transparent 54%
    ),
    linear-gradient(
      180deg,
      ${({ $active, theme }) =>
        $active ? `${theme.colors.background.tertiary}` : `${theme.colors.background.secondary}`} 0%,
      ${({ theme }) => theme.colors.background.primary} 100%
    );
  color: ${({ $active, theme }) =>
    $active ? theme.colors.accent.primary : theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: ${({ $active, theme }) =>
    $active ? `0 0 18px rgba(122, 223, 255, 0.18)` : theme.shadows.sm};
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $active, theme }) =>
      $active ? `${theme.colors.borders.active}` : `${theme.colors.borders.active}90`};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    min-width: 0;
    flex: 1 1 0;
  }
`

export const HeaderMetaText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  text-align: right;
`

export const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.5px;
  white-space: nowrap;
`

export const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
    gap: 10px;
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }
`

export const CardsArea = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr); /* Force 3 rows */
  gap: 12px;
  padding: 4px;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: none;
    overflow: visible;
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
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

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
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

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`

export const MenuPickerOverlay = styled.button`
  position: fixed;
  inset: 0;
  border: none;
  background: rgba(2, 8, 20, 0.72);
  backdrop-filter: blur(4px);
  z-index: 180;
`

export const MenuPickerDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(92vw, 520px);
  max-height: min(84vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.secondary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  z-index: 190;

  @media (max-width: 768px) {
    inset: auto 0 0 0;
    width: 100vw;
    max-height: 82dvh;
    transform: none;
    border-radius: 20px 20px 0 0;
  }
`

export const MenuPickerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
`

export const MenuPickerTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const MenuPickerTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const MenuPickerSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: 1.45;
`

export const MenuPickerClose = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export const MenuPickerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px 18px;
  overflow-y: auto;
`

export const MenuPickerItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accent.primary : theme.colors.borders.primary};
  background: ${({ $active, theme }) =>
    $active ? `${theme.colors.accent.primary}18` : theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`

export const MenuPickerItemTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const MenuPickerItemBadge = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

export const PageControls = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;
  }
`

export const PageButton = styled.button`
  min-width: 146px;
  min-height: 52px;
  padding: 12px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: ${({ theme }) => theme.colors.background.tertiary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    filter 0.18s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.accent.primary};
    filter: brightness(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    flex: 1 1 0;
  }
`
