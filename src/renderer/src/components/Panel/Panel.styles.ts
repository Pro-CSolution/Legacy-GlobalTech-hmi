import styled from 'styled-components'
import { getPositionStyles, PositionProps } from '../../styles/mixins'

export const PanelContainer = styled.div<PositionProps>`
  display: flex;
  flex-direction: column;
  ${(props) => getPositionStyles(props)}
`
