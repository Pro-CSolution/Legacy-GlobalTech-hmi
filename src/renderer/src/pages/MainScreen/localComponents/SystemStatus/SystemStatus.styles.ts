import styled, { css } from 'styled-components'
import { default as StatusBadgeBase } from 'components/StatusBadge'
import { Label, Badge, StatusText, Container } from 'components/StatusBadge/StatusBadge.styles'

export const StatusBadge = styled(StatusBadgeBase)`
  ${() => css`
    ${Container} {
      margin-bottom: 4px;
    }

    ${Label} {
      font-size: 15px;
      margin-bottom: 2px;
      margin-left: 2px;
    }

    ${Badge} {
      padding: 4px 8px;
      min-height: 34px;
    }

    ${StatusText} {
      font-size: 16px;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  `}
`
