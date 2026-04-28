import styled from 'styled-components'

export const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-height: 100%;
`

export const ContentContainer = styled.main<{ $mobileViewOnly?: boolean }>`
  flex-grow: 1;
  position: relative;
  min-height: 0;
  overflow: ${({ $mobileViewOnly }) => ($mobileViewOnly ? 'auto' : 'hidden')};
  padding: 16px;

  ${({ $mobileViewOnly }) =>
    $mobileViewOnly &&
    `
      display: flex;
      flex-direction: column;
      padding: 12px 12px calc(96px + env(safe-area-inset-bottom));
    `}
`
