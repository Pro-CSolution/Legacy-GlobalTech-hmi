import { useMemo, useRef, useState } from 'react'
import { Zap } from 'lucide-react'
import Card from 'components/Card'
import Gauge, { HmiData } from 'components/Gauge'
import Panel from 'components/Panel'
import {
  GaugeConfigModal,
  type GaugeConfigValue,
  type GaugeVariableOption
} from 'components/GaugeConfigModal'
import { useTheme } from 'styled-components'
import { PositionProps } from 'styles/mixins'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { AVAILABLE_VARIABLES } from 'pages/TrendScreen/constants'
import { DeviceId, PARAMETER_ALIASES, PARAMETER_META, ParameterId } from 'types'
import { ElectricalGrid, GaugeLabel, GaugeTile } from '../MainScreen.styles'

type ElectricalGaugeSlotId = 'lineVoltage' | 'frequency' | 'power' | 'current' | 'torque' | 'master'

type StoredGaugeConfig = {
  parameterId: ParameterId
  minValue: number
  maxValue: number
}

type DeviceSnapshot = Record<string, string | number | boolean | null | undefined>

const STORAGE_KEY = 'main_screen_electrical_gauges_v1'
const LONG_PRESS_MS = 500

const DEFAULT_CONFIG: Record<ElectricalGaugeSlotId, StoredGaugeConfig> = {
  lineVoltage: {
    parameterId: PARAMETER_ALIASES.motorVolts,
    minValue: 0,
    maxValue: 600
  },
  frequency: {
    parameterId: PARAMETER_ALIASES.frequencyFeedback,
    minValue: 0,
    maxValue: 120
  },
  power: {
    parameterId: PARAMETER_ALIASES.motorPower,
    minValue: 0,
    maxValue: 700
  },
  current: {
    parameterId: PARAMETER_ALIASES.motorCurrent,
    minValue: 0,
    maxValue: 800
  },
  torque: {
    parameterId: PARAMETER_ALIASES.torqueDemand,
    minValue: -50,
    maxValue: 150
  },
  master: {
    parameterId: PARAMETER_ALIASES.dcLinkVoltage,
    minValue: 0,
    maxValue: 1000
  }
}

const isBrowser = (): boolean => typeof window !== 'undefined'

const isValidParameterId = (value: unknown): value is ParameterId => {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(PARAMETER_META, value as string)
  )
}

const isBoolParam = (id: ParameterId): boolean => {
  const unit = PARAMETER_META[id]?.unit
  return unit === 'Bool'
}

const sanitizeStoredConfig = (value: unknown): Record<ElectricalGaugeSlotId, StoredGaugeConfig> => {
  if (!value || typeof value !== 'object') return DEFAULT_CONFIG
  const obj = value as Record<string, unknown>
  const next: Record<ElectricalGaugeSlotId, StoredGaugeConfig> = { ...DEFAULT_CONFIG }

  ;(Object.keys(DEFAULT_CONFIG) as ElectricalGaugeSlotId[]).forEach((slotId) => {
    const slot = obj[slotId]
    if (!slot || typeof slot !== 'object') return
    const raw = slot as Record<string, unknown>

    const parameterId = raw.parameterId
    const minValue = Number(raw.minValue)
    const maxValue = Number(raw.maxValue)

    if (!isValidParameterId(parameterId)) return
    if (isBoolParam(parameterId)) return
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return
    if (minValue >= maxValue) return

    next[slotId] = { parameterId, minValue, maxValue }
  })

  return next
}

const loadStoredConfig = (): Record<ElectricalGaugeSlotId, StoredGaugeConfig> => {
  if (!isBrowser()) return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return sanitizeStoredConfig(JSON.parse(raw))
  } catch {
    return DEFAULT_CONFIG
  }
}

const persistStoredConfig = (config: Record<ElectricalGaugeSlotId, StoredGaugeConfig>): void => {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.warn('Failed to persist gauge configuration', err)
  }
}

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : typeof value === 'boolean'
          ? value
            ? 1
            : 0
          : Number.NaN
  return Number.isFinite(n) ? n : undefined
}

const getDisplayMeta = (parameterId: ParameterId): { label: string; unit?: string } => {
  const preset = AVAILABLE_VARIABLES.find((v) => v.id === parameterId)
  if (preset) return { label: preset.label, unit: preset.unit }
  const meta = PARAMETER_META[parameterId]
  return { label: meta?.name || parameterId, unit: meta?.unit }
}

const buildVariableOptions = (snapshot: DeviceSnapshot): GaugeVariableOption[] => {
  const map = new Map<string, GaugeVariableOption>()

  // 1) Curated critical variables
  AVAILABLE_VARIABLES.forEach((v) => {
    if (isBoolParam(v.id)) return
    map.set(v.id, { id: v.id, label: v.label, unit: v.unit, group: v.category })
  })

  // 2) Live variables (cyclic or already on-demand from other screens)
  Object.keys(snapshot || {}).forEach((rawId) => {
    if (!isValidParameterId(rawId)) return
    if (isBoolParam(rawId)) return
    if (map.has(rawId)) return

    const meta = PARAMETER_META[rawId]
    map.set(rawId, {
      id: rawId,
      label: meta?.name || rawId,
      unit: meta?.unit,
      group: 'Live'
    })
  })

  return Array.from(map.values())
}

interface ElectricalParamsProps extends PositionProps {
  deviceId: DeviceId
  deviceSnapshot: DeviceSnapshot
  height?: number
}

export const ElectricalParams = ({
  deviceId,
  deviceSnapshot,
  height = 460,
  ...positionProps
}: ElectricalParamsProps) => {
  const theme = useTheme()
  const [configBySlot, setConfigBySlot] =
    useState<Record<ElectricalGaugeSlotId, StoredGaugeConfig>>(loadStoredConfig)

  // Keep selected variables live (even if they are not part of the cyclic snapshot).
  const parameterIdsToKeepLive = useMemo(() => {
    const ids = Object.values(configBySlot).map((c) => c.parameterId)
    return Array.from(new Set(ids))
  }, [configBySlot])

  useOnDemandParameters({
    deviceId,
    parameterIds: parameterIdsToKeepLive,
    limit: 12
  })

  const variableOptions = useMemo(() => buildVariableOptions(deviceSnapshot), [deviceSnapshot])

  const gaugeCommonProps = useMemo(
    () => ({
      size: { height: 140 },
      backgroundColor: theme.colors.background.secondary,
      degradedColor: theme.colors.background.tertiary,
      fontProperties: {
        textColor: theme.colors.text.primary,
        fontSizeValue: 23,
        fontSizeUnitOfMeasure: 18,
        fontSizeIndicatorNumber: 14
      },
      arrowProperties: {
        color: theme.colors.accent.primary
      }
    }),
    [theme]
  )

  const gaugeSlots: Array<{ slotId: ElectricalGaugeSlotId }> = useMemo(
    () => [
      { slotId: 'lineVoltage' },
      { slotId: 'frequency' },
      { slotId: 'power' },
      { slotId: 'current' },
      { slotId: 'torque' },
      { slotId: 'master' }
    ],
    []
  )

  const pressTimer = useRef<number | null>(null)
  const [editingSlot, setEditingSlot] = useState<ElectricalGaugeSlotId | null>(null)

  const openEditor = (slotId: ElectricalGaugeSlotId) => {
    setEditingSlot(slotId)
  }

  const cancelPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const startPress = (slotId: ElectricalGaugeSlotId) => {
    cancelPress()
    pressTimer.current = window.setTimeout(() => {
      openEditor(slotId)
    }, LONG_PRESS_MS)
  }

  const editingConfig: GaugeConfigValue | null = editingSlot ? configBySlot[editingSlot] : null
  const editingTitle = 'Configure gauge'
  const editingSubtitle = editingConfig
    ? getDisplayMeta(editingConfig.parameterId).label
    : undefined

  const handleSave = (next: GaugeConfigValue) => {
    if (!editingSlot) return
    setConfigBySlot((prev) => {
      const updated = { ...prev, [editingSlot]: next }
      persistStoredConfig(updated)
      return updated
    })
    setEditingSlot(null)
  }

  return (
    <>
      <Panel width={1080} height={height} {...positionProps}>
        <Card
          title="Electrical Parameters"
          icon={Zap}
          height="100%"
          headerRight="Hold any Gauge to edit"
        >
          <ElectricalGrid>
            {gaugeSlots.map(({ slotId }) => {
              const cfg = configBySlot[slotId] ?? DEFAULT_CONFIG[slotId]
              const { label, unit } = getDisplayMeta(cfg.parameterId)
              const liveRaw = deviceSnapshot?.[cfg.parameterId]
              const value = toNumberOrUndefined(liveRaw)

              const gaugeProps: HmiData = {
                value,
                unitOfMeasure: unit,
                minValue: cfg.minValue,
                maxValue: cfg.maxValue
              }

              return (
                <GaugeTile
                  key={slotId}
                  onMouseDown={() => startPress(slotId)}
                  onMouseUp={cancelPress}
                  onMouseLeave={cancelPress}
                  onTouchStart={() => startPress(slotId)}
                  onTouchEnd={cancelPress}
                  onTouchCancel={cancelPress}
                >
                  <GaugeLabel>{label}</GaugeLabel>
                  <Gauge {...gaugeCommonProps} {...gaugeProps} />
                </GaugeTile>
              )
            })}
          </ElectricalGrid>
        </Card>
      </Panel>

      {editingSlot && editingConfig && (
        <GaugeConfigModal
          isOpen={!!editingSlot}
          title={editingTitle}
          subtitle={editingSubtitle}
          variables={[
            // Asegura que la actual esté siempre disponible en el select
            ...(!variableOptions.some((v) => v.id === editingConfig.parameterId)
              ? [
                  {
                    id: editingConfig.parameterId,
                    label: getDisplayMeta(editingConfig.parameterId).label,
                    unit: getDisplayMeta(editingConfig.parameterId).unit,
                    group: 'Current'
                  }
                ]
              : []),
            ...variableOptions
          ]}
          initialValue={editingConfig}
          onClose={() => setEditingSlot(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
