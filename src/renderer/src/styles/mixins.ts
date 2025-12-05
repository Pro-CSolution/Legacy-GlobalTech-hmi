import { css, RuleSet } from 'styled-components'

export interface PositionProps {
  width?: string | number
  height?: string | number
  position?: {
    left?: string | number
    top?: string | number
    right?: string | number
    bottom?: string | number
  }
}

const POSITION_PROP_KEYS = new Set(['width', 'height', 'position'])

export const shouldForwardPositionProp = (prop: string): boolean => !POSITION_PROP_KEYS.has(prop)

export const getPositionStyles = (props: PositionProps): RuleSet<object> => css`
  /* Dimensiones exactas */
  ${props.width &&
  css`
    width: ${typeof props.width === 'number' ? `${props.width}px` : props.width};
  `}
  ${props.height &&
  css`
    height: ${typeof props.height === 'number' ? `${props.height}px` : props.height};
  `}

  /* Posicionamiento */
  ${props.position &&
  css`
    position: absolute;
    left: ${props.position.left
      ? typeof props.position.left === 'number'
        ? `${props.position.left}px`
        : props.position.left
      : 'auto'};
    top: ${props.position.top
      ? typeof props.position.top === 'number'
        ? `${props.position.top}px`
        : props.position.top
      : 'auto'};
    right: ${props.position.right
      ? typeof props.position.right === 'number'
        ? `${props.position.right}px`
        : props.position.right
      : 'auto'};
    bottom: ${props.position.bottom
      ? typeof props.position.bottom === 'number'
        ? `${props.position.bottom}px`
        : props.position.bottom
      : 'auto'};
  `}
`
