import styled from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'

export const PanelContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => shouldForwardPositionProp(prop)
})<PositionProps>`
  display: flex;
  flex-direction: column;
  ${(props) => getPositionStyles(props)}
`
