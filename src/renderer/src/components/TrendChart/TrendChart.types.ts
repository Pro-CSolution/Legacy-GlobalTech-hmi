/**
 * TrendChart Component Types
 * Industrial HMI trend chart for real-time data visualization
 */
import type uPlot from 'uplot'

/** Single data point in the chart */
export interface ChartDataPoint {
  /** X coordinate (time in seconds from start) */
  x: number
  /** Y coordinate (value) */
  y: number
}

/** Dataset configuration */
export interface Dataset {
  /** Array of data points */
  data: ChartDataPoint[]
  /** Line color */
  borderColor?: string
  /** Mark dataset como entrada manual */
  isManual?: boolean
  /** Render stepped line */
  stepped?: boolean
  /** Unidad opcional */
  unit?: string | null
  /** Fill color (if fill is enabled) */
  backgroundColor?: string
  /** Line width in pixels */
  borderWidth?: number
  /** Whether to fill area under the line */
  fill?: boolean
  /** Line smoothness (0 = straight, 0.4 = smooth) */
  tension?: number
  /** Point radius (0 = no points) */
  pointRadius?: number
  /** Point radius on hover */
  pointHoverRadius?: number
  /** Dataset label for legend */
  label?: string
}

/** Scale axis configuration */
export interface ScaleConfig {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
  /** Whether to display the axis */
  display?: boolean
  /** Whether to show grid lines */
  grid?: boolean
  /** Axis title configuration */
  title?: {
    display: boolean
    text: string
  }
  /** Ticks configuration */
  ticks?: Record<string, unknown>
}

/** Chart scales configuration */
export interface ChartScales {
  x?: ScaleConfig
  y?: ScaleConfig
}

/** Component variant for different visual styles */
export type TrendChartVariant = 'modern' | 'industrial' | 'minimal'

/** Position configuration */
export interface Position {
  left?: number
  top?: number
  right?: number
  bottom?: number
}

/** Demo data configuration */
export interface DemoDataConfig {
  /** Number of data points to generate */
  pointCount?: number
  /** Minimum Y value */
  minValue?: number
  /** Maximum Y value */
  maxValue?: number
  /** Base value for noise generation */
  baseValue?: number
  /** Noise amplitude */
  noiseAmplitude?: number
  /** Update interval in milliseconds */
  updateInterval?: number
}

/** Main component props */
export interface TrendChartProps {
  // === Data ===
  /** Array of datasets to display */
  datasets?: Dataset[]
  /** Enable demo data mode (auto-generated data) */
  demoData?: boolean
  /** Demo data configuration */
  demoDataConfig?: DemoDataConfig

  // === Time Configuration ===
  /** Time window in minutes (default: 5) */
  timeWindow?: number
  /** Data update interval in milliseconds (default: 1000) */
  updateInterval?: number

  // === Dimensions ===
  /** Component width in pixels or CSS value */
  width?: string | number
  /** Component height in pixels or CSS value */
  height?: string | number

  // === Positioning ===
  /** Absolute position within parent */
  position?: Position

  // === Styling ===
  /** Visual style variant */
  variant?: TrendChartVariant
  /** Background color override */
  backgroundColor?: string
  /** Border color override */
  borderColor?: string
  /** Grid line color */
  gridColor?: string
  /** Text/label color */
  textColor?: string
  /** Chart line color (primary dataset) */
  lineColor?: string

  // === Scale Configuration ===
  /** Scale axis configuration */
  scales?: ChartScales

  // === Visual Options ===
  /** Show grid lines */
  showGrid?: boolean
  /** Show legend */
  showLegend?: boolean
  /** Show tooltips on hover */
  showTooltips?: boolean
  /** Show fixed inspector panel with current values */
  showInspector?: boolean
  /** Allow clicking to pin a point for comparison */
  enablePinning?: boolean
  /** Responsive mode */
  responsive?: boolean
  /** Maintain aspect ratio */
  maintainAspectRatio?: boolean
  /** Show title bar */
  showTitle?: boolean
  /** Chart title */
  title?: string

  // === Styling Props ===
  /** Additional CSS class */
  className?: string
  /** Inline styles */
  style?: React.CSSProperties

  // === Callbacks ===
  /** Called when a data point is clicked */
  onDataPointClick?: (point: ChartDataPoint, datasetIndex: number) => void
  /** Called on chart hover */
  onHover?: (event: unknown, elements: unknown[]) => void
}

/** Ref methods exposed by the component */
export interface TrendChartRef {
  /** Get the uPlot instance */
  getChart: () => uPlot | null
  /** Update chart data programmatically */
  updateData: (newDatasets: Dataset[]) => void
  /** Export current chart as a data URL (base64) */
  exportImage: (opts?: { type?: 'image/png' | 'image/jpeg'; quality?: number }) => string | null
  /** Reset chart to initial state */
  reset: () => void
  /** Add a new data point to a dataset */
  addDataPoint: (datasetIndex: number, point: ChartDataPoint) => void
  /** Clear all data */
  clearData: () => void
}
