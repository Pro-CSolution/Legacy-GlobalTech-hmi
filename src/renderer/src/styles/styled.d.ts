import 'styled-components'
import { Theme } from './theme'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {
    // Gauge component local theme overrides (applied via ThemeProvider in Gauge)
    backgroundColor?: string
    degradedColor?: string
    arrowWidth?: number
    arrowColor?: string
    textColor?: string
    fontSizeValue?: number
    fontSizeUnitOfMeasure?: number
    fontSizeIndicatorNumber?: number
  }
}
