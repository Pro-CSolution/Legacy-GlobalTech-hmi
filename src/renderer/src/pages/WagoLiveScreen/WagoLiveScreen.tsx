import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ModalBase } from 'components/Modal'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import {
  clearWagoDisplayNameOverride,
  setWagoDisplayNameOverride,
  usePreferredSingleMotorScope,
  useTopBannerNotice,
  useWagoDisplayNameOverrides
} from 'hooks'
import { ScreenLayout } from 'layouts'
import {
  fetchWagoLiveSnapshot,
  getDeviceNetworkConfigs,
  writeWagoLiveCoil,
  writeWagoLiveRegister,
  type WagoLiveRegisterType
} from 'services'
import { getErrorMessage } from 'types/errors'
import { getMotorScopeLabel, getMotorWagoDeviceId } from 'utils/motorDeviceMapping'
import {
  Cell,
  ControlRail,
  Description,
  HeadCell,
  IoBulb,
  IoCardGrid,
  IoCardsScroll,
  IoChannel,
  IoChannelHeader,
  IoChannelMeta,
  IoChannelName,
  IoChannelState,
  IoChannelTitleBlock,
  IoChannelValue,
  IoChannelValueRow,
  IoModuleCard,
  IoModuleChannels,
  IoModuleHeader,
  IoModuleHeaderSlot,
  IoSection,
  IoSectionDivider,
  IoSectionDescription,
  IoSectionHeader,
  IoSectionMeta,
  IoSectionTitle,
  IoSectionTitleBlock,
  InlineForceCell,
  InlineForceHint,
  InlineForceToggle,
  InlineForceValue,
  InlineForceWriteButton,
  IndexCell,
  MetaText,
  PageContainer,
  RenameModalActions,
  RenameModalBody,
  RenameModalButton,
  RenameModalField,
  RenameModalInput,
  RenameModalLabel,
  RenameModalText,
  RenameModalTitle,
  RenameableTextButton,
  Row,
  SelectorButton,
  SelectorGroup,
  StatusBadge,
  StatusGroup,
  Subtitle,
  SummaryChip,
  Table,
  TableCard,
  TableScroll,
  Tag,
  Title,
  TitleBlock,
  TopBar,
  ValueText
} from './WagoLiveScreen.styles'
import {
  WAGO_LIVE_ROWS,
  type WagoMonitorGroupLabel,
  type WagoSpreadsheetRow
} from './wagoSpreadsheetRows'

type DirectReadValueMap = Record<number, number | null>
type DirectReadValueStore = Record<WagoLiveRegisterType, DirectReadValueMap>
type WagoLiveMotorScope = 1 | 2
type WagoLiveTab = 'monitor' | 'cards'
type WagoInlineForceMode = 'digital-write' | 'digital-readonly' | 'analog-write' | 'analog-readonly'
type WagoIoCardTone = 'analog-input' | 'digital-input' | 'digital-output' | 'analog-output'
type WagoIoCardLayoutModule = {
  key: string
  rowIds: readonly string[]
}
type WagoIoCardSignalTypeCode = 'AI' | 'AO' | 'DI' | 'DO'
type WagoRenameTarget = {
  id: string
  group: WagoMonitorGroupLabel
  signalIndex: number
  plcTagNumber: number
  tag: string
  name: string
  displayName: string
  label: string
}

const MOTOR_TWO_ROW_OVERRIDES: Readonly<
  Record<string, Pick<WagoSpreadsheetRow, 'modbusRegister' | 'modbusOffset' | 'sourceOffset'>>
> = {}

const createIoCardRowId = (signalTypeCode: WagoIoCardSignalTypeCode, index: number): string =>
  `${signalTypeCode}-${String(index).padStart(3, '0')}`

const createSequentialIoCardModuleLayout = (
  signalTypeCode: WagoIoCardSignalTypeCode,
  startIndex: number,
  signalCount: number,
  keyPrefix: string
): WagoIoCardLayoutModule[] => {
  const modules: WagoIoCardLayoutModule[] = []

  for (let index = startIndex; index < startIndex + signalCount; index += 2) {
    modules.push({
      key: `${keyPrefix}-${String(index).padStart(2, '0')}`,
      rowIds: [
        createIoCardRowId(signalTypeCode, index),
        createIoCardRowId(signalTypeCode, index + 1)
      ]
    })
  }

  return modules
}

// Keep the rack-order card list isolated to this screen so the live monitor and force tabs
// continue to use the broader legacy row set unchanged.
const WAGO_IO_CARD_MODULE_LAYOUT: ReadonlyArray<WagoIoCardLayoutModule> = [
  ...createSequentialIoCardModuleLayout('AI', 1, 4, 'ai'),
  ...createSequentialIoCardModuleLayout('AO', 1, 4, 'ao'),
  ...createSequentialIoCardModuleLayout('AI', 5, 22, 'ai'),
  ...createSequentialIoCardModuleLayout('DI', 1, 40, 'di'),
  ...createSequentialIoCardModuleLayout('DO', 1, 30, 'do')
] as const

const WAGO_LIVE_MOTOR_OPTIONS: ReadonlyArray<{
  scope: WagoLiveMotorScope
  label: string
  deviceId: string
}> = [
  {
    scope: 1,
    label: getMotorScopeLabel(1),
    deviceId: getMotorWagoDeviceId(1)
  },
  {
    scope: 2,
    label: getMotorScopeLabel(2),
    deviceId: getMotorWagoDeviceId(2)
  }
]

const createEmptyValueStore = (): DirectReadValueStore => ({
  input: {},
  holding: {},
  discrete: {},
  coil: {}
})

const WAGO_LIVE_POLL_MS = 1000
const WAGO_COIL_MODBUS_BASE = 30511
const WAGO_ANALOG_OUTPUT_ADDRESS_BASE = 512
const SHOW_UNMAPPED_RACK_LABEL = false
const IO_CARD_GROUP_ORDER: ReadonlyArray<WagoMonitorGroupLabel> = [
  'Analog Input',
  'Digital Input',
  'Digital Output',
  'Analog Output'
] as const
const WAGO_RENAME_HOLD_MS = 700

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 3
})

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '--'
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? numberFormatter.format(value) : '--'
  }

  if (typeof value === 'string') {
    return value.trim() ? value : '--'
  }

  return String(value)
}

const getSignalTypeCode = (group: WagoMonitorGroupLabel): string => {
  switch (group) {
    case 'Analog Input':
      return 'AI'
    case 'Digital Input':
      return 'DI'
    case 'Digital Output':
      return 'DO'
    case 'Analog Output':
      return 'AO'
  }
}

const getGroupFromSignalTypeCode = (code: WagoIoCardSignalTypeCode): WagoMonitorGroupLabel => {
  switch (code) {
    case 'AI':
      return 'Analog Input'
    case 'DI':
      return 'Digital Input'
    case 'DO':
      return 'Digital Output'
    case 'AO':
      return 'Analog Output'
  }
}

const getRegisterTypeFromSignalTypeCode = (
  code: WagoIoCardSignalTypeCode
): WagoLiveRegisterType => {
  switch (code) {
    case 'AI':
      return 'input'
    case 'AO':
      return 'holding'
    case 'DI':
      return 'discrete'
    case 'DO':
      return 'coil'
  }
}

const getModbusRegisterBase = (registerType: WagoLiveRegisterType): number => {
  switch (registerType) {
    case 'input':
      return 300001
    case 'holding':
      return 400001
    case 'discrete':
      return 30001
    case 'coil':
      return 30511
  }
}

const parseIoCardRowId = (
  rowId: string
): { code: WagoIoCardSignalTypeCode; ordinal: number } | null => {
  const match = /^([A-Z]{2})-(\d+)$/.exec(rowId)

  if (!match) {
    return null
  }

  const code = match[1] as WagoIoCardSignalTypeCode
  if (!['AI', 'AO', 'DI', 'DO'].includes(code)) {
    return null
  }

  const ordinal = Number.parseInt(match[2], 10)
  if (!Number.isInteger(ordinal) || ordinal <= 0) {
    return null
  }

  return { code, ordinal }
}

const getIoCardRackAddress = (code: WagoIoCardSignalTypeCode, ordinal: number): number => {
  const zeroBasedOrdinal = ordinal - 1

  if (code === 'AO') {
    return WAGO_ANALOG_OUTPUT_ADDRESS_BASE + zeroBasedOrdinal
  }

  if (code === 'DI') {
    const moduleIndex = Math.floor(zeroBasedOrdinal / 2)
    const channelIndex = zeroBasedOrdinal % 2
    return moduleIndex * 4 + 4 + channelIndex
  }

  return zeroBasedOrdinal
}

const getSignalTypeTone = (group: WagoMonitorGroupLabel): WagoIoCardTone => {
  switch (group) {
    case 'Analog Input':
      return 'analog-input'
    case 'Digital Input':
      return 'digital-input'
    case 'Digital Output':
      return 'digital-output'
    case 'Analog Output':
      return 'analog-output'
  }
}

const formatSignalIndex = (value: number): string => String(value).padStart(2, '0')
const formatIoCardPointLabel = (code: string, signalIndex: number): string =>
  `${code} ${formatSignalIndex(signalIndex)}`
const getIoCardModuleIndex = (signalIndex: number): number => Math.floor(signalIndex / 2)
const getIoCardChannelIndex = (signalIndex: number): number => (signalIndex % 2) + 1
const formatIoCardModuleLabel = (code: string, signalIndex: number): string =>
  `${code} ${formatSignalIndex(getIoCardModuleIndex(signalIndex))}`
const formatIoCardChannelLabel = (signalIndex: number): string =>
  `CH ${getIoCardChannelIndex(signalIndex)}`
const formatIoCardSignalLabel = (code: string, signalIndex: number): string =>
  `${formatIoCardModuleLabel(code, signalIndex)} ${formatIoCardChannelLabel(signalIndex)}`
const formatIoCardSlotLabel = (code: string, signalIndex: number): string =>
  formatIoCardSignalLabel(code, signalIndex)
const formatDigitalOutputReadAddressLabel = (address: number): string =>
  `Read addr: DO ${formatSignalIndex(address)}`

const getRowSourceAddress = (entry: WagoSpreadsheetRow): number =>
  entry.sourceRegisterType === 'coil'
    ? entry.modbusRegister - WAGO_COIL_MODBUS_BASE
    : entry.sourceOffset

const getRowInlineForceMode = (entry: WagoSpreadsheetRow): WagoInlineForceMode => {
  if (entry.sourceRegisterType === 'coil') {
    return 'digital-write'
  }

  if (entry.sourceRegisterType === 'holding') {
    return 'analog-write'
  }

  if (entry.sourceRegisterType === 'discrete') {
    return 'digital-readonly'
  }

  return 'analog-readonly'
}

const getRowAccessText = (entry: WagoSpreadsheetRow): string =>
  entry.sourceRegisterType === 'coil' || entry.sourceRegisterType === 'holding'
    ? 'R,W'
    : entry.access || '--'

const toSpreadsheetValue = (
  _entry: WagoSpreadsheetRow,
  rawSourceValue: number | null | undefined
): number | null => {
  if (rawSourceValue === null || rawSourceValue === undefined || !Number.isFinite(rawSourceValue)) {
    return null
  }

  return rawSourceValue
}

const isSignalActive = (row: {
  sourceRegisterType: WagoLiveRegisterType
  value: number | null | undefined
}): boolean => {
  if (typeof row.value !== 'number' || !Number.isFinite(row.value)) {
    return false
  }

  if (row.sourceRegisterType === 'discrete' || row.sourceRegisterType === 'coil') {
    return row.value === 1
  }

  return Math.abs(row.value) > 0
}

const isRegisterValueActive = (
  registerType: WagoLiveRegisterType,
  value: number | null | undefined
): boolean => isSignalActive({ sourceRegisterType: registerType, value })

const getSignalStateLabel = (row: {
  sourceRegisterType: WagoLiveRegisterType
  value: number | null | undefined
}): string => {
  if (typeof row.value !== 'number' || !Number.isFinite(row.value)) {
    return 'No Data'
  }

  if (row.sourceRegisterType === 'discrete' || row.sourceRegisterType === 'coil') {
    return row.value === 1 ? 'High' : 'Low'
  }

  return Math.abs(row.value) > 0 ? 'Active' : 'Zero'
}

interface WagoLivePanelProps {
  embedded?: boolean
  active?: boolean
}

export const WagoLivePanel = ({ embedded = false, active = true }: WagoLivePanelProps) => {
  const preferredSingleMotorScope = usePreferredSingleMotorScope()
  const { showNotice } = useTopBannerNotice()
  const [selectedMotorScope, setSelectedMotorScope] =
    useState<WagoLiveMotorScope>(preferredSingleMotorScope)
  const [activeTab, setActiveTab] = useState<WagoLiveTab>('cards')
  const [valuesByType, setValuesByType] = useState<DirectReadValueStore>(() =>
    createEmptyValueStore()
  )
  const [deviceConnected, setDeviceConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deviceHostById, setDeviceHostById] = useState<Record<string, string>>({})
  const [inlineForceRowId, setInlineForceRowId] = useState<string | null>(null)
  const [inlineForceDrafts, setInlineForceDrafts] = useState<Record<string, string>>({})
  const [renameTarget, setRenameTarget] = useState<WagoRenameTarget | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [renameKeyboardVisible, setRenameKeyboardVisible] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  )
  const requestIdRef = useRef(0)
  const renameHoldTimerRef = useRef<number | null>(null)
  const renameHoldPointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const displayNameOverrides = useWagoDisplayNameOverrides()
  const selectedMotorOption = WAGO_LIVE_MOTOR_OPTIONS.find(
    (option) => option.scope === selectedMotorScope
  )!
  const selectedMotorHost = deviceHostById[selectedMotorOption.deviceId] ?? '--'
  const selectedMotor = {
    ...selectedMotorOption,
    host: selectedMotorHost
  }
  const shouldUseVirtualKeyboard = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia('(pointer: coarse)').matches
  }, [])
  const spreadsheetRows = useMemo(
    () =>
      selectedMotorScope === 2
        ? WAGO_LIVE_ROWS.map((row) => {
            const override = MOTOR_TWO_ROW_OVERRIDES[row.id]
            return override ? { ...row, ...override } : row
          })
        : WAGO_LIVE_ROWS,
    [selectedMotorScope]
  )
  const isPanelActive = active && isDocumentVisible
  const cardSourceRequests = useMemo(() => {
    if (activeTab !== 'cards') {
      return [] as Array<[WagoLiveRegisterType, number[]]>
    }

    const grouped: Record<WagoLiveRegisterType, number[]> = {
      input: [],
      holding: [],
      discrete: [],
      coil: []
    }

    WAGO_IO_CARD_MODULE_LAYOUT.forEach((moduleLayout) => {
      moduleLayout.rowIds.forEach((rowId) => {
        const parsedRowId = parseIoCardRowId(rowId)
        if (!parsedRowId) {
          return
        }

        const registerType = getRegisterTypeFromSignalTypeCode(parsedRowId.code)
        const address = getIoCardRackAddress(parsedRowId.code, parsedRowId.ordinal)
        if (!grouped[registerType].includes(address)) {
          grouped[registerType].push(address)
        }
      })
    })
    ;(Object.keys(grouped) as WagoLiveRegisterType[]).forEach((registerType) => {
      grouped[registerType].sort((left, right) => left - right)
    })

    return (Object.entries(grouped) as Array<[WagoLiveRegisterType, number[]]>).filter(
      ([, addresses]) => addresses.length > 0
    )
  }, [activeTab])
  const sourceRequests = useMemo(() => {
    const grouped: Record<WagoLiveRegisterType, number[]> = {
      input: [],
      holding: [],
      discrete: [],
      coil: []
    }

    spreadsheetRows.forEach((entry) => {
      if (!grouped[entry.sourceRegisterType].includes(entry.modbusRegister)) {
        grouped[entry.sourceRegisterType].push(entry.modbusRegister)
      }
    })

    cardSourceRequests.forEach(([registerType, addresses]) => {
      addresses.forEach((address) => {
        if (!grouped[registerType].includes(address)) {
          grouped[registerType].push(address)
        }
      })
    })
    ;(Object.keys(grouped) as WagoLiveRegisterType[]).forEach((registerType) => {
      grouped[registerType].sort((left, right) => left - right)
    })

    return (Object.entries(grouped) as Array<[WagoLiveRegisterType, number[]]>).filter(
      ([, addresses]) => addresses.length > 0
    )
  }, [cardSourceRequests, spreadsheetRows])

  useEffect(() => {
    setSelectedMotorScope(preferredSingleMotorScope)
  }, [preferredSingleMotorScope])

  useEffect(() => {
    setInlineForceRowId(null)
    setInlineForceDrafts({})
  }, [selectedMotor.deviceId])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (renameHoldTimerRef.current !== null) {
        window.clearTimeout(renameHoldTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void getDeviceNetworkConfigs()
      .then((devices) => {
        if (cancelled) return
        setDeviceHostById(
          devices.reduce<Record<string, string>>((map, device) => {
            map[device.id] = device.host
            return map
          }, {})
        )
      })
      .catch(() => {
        if (!cancelled) {
          setDeviceHostById({})
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isPanelActive) {
      requestIdRef.current += 1
      setIsLoading(false)
      setValuesByType(createEmptyValueStore())
      setDeviceConnected(false)
      return
    }

    let mounted = true

    setIsLoading(true)
    setValuesByType(createEmptyValueStore())
    setDeviceConnected(false)
    const loadSnapshot = async () => {
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

      try {
        const results = await Promise.allSettled(
          sourceRequests.map(([registerType, addresses]) =>
            fetchWagoLiveSnapshot({
              deviceId: selectedMotor.deviceId,
              registerType,
              addresses
            })
          )
        )

        if (!mounted || requestId !== requestIdRef.current) {
          return
        }

        const nextValues = createEmptyValueStore()
        let anyConnected = false
        let hasSuccessfulSnapshot = false

        results.forEach((result, index) => {
          const [registerType] = sourceRequests[index]
          if (!registerType || result.status !== 'fulfilled') {
            return
          }

          hasSuccessfulSnapshot = true
          anyConnected = anyConnected || result.value.connected

          nextValues[registerType] = result.value.values.reduce<DirectReadValueMap>(
            (map, entry) => {
              map[entry.address] = entry.value
              return map
            },
            {}
          )
        })

        if (!hasSuccessfulSnapshot) {
          setValuesByType(createEmptyValueStore())
          setDeviceConnected(false)
          return
        }

        setValuesByType(nextValues)
        setDeviceConnected(anyConnected)
      } catch {
        if (!mounted || requestId !== requestIdRef.current) {
          return
        }

        // Clear values on failed reads so the screen never keeps stale PLC data around.
        setValuesByType(createEmptyValueStore())
        setDeviceConnected(false)
      } finally {
        if (mounted && requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    void loadSnapshot()
    const intervalId = window.setInterval(() => {
      void loadSnapshot()
    }, WAGO_LIVE_POLL_MS)

    return () => {
      mounted = false
      if (intervalId !== undefined) {
        window.clearInterval(intervalId)
      }
    }
  }, [isPanelActive, selectedMotor.deviceId, sourceRequests])

  const rows = useMemo(() => {
    const signalIndexByGroup = new Map<WagoMonitorGroupLabel, number>()

    return spreadsheetRows.map((entry, index) => {
      const signalIndex = signalIndexByGroup.get(entry.group) ?? 0
      signalIndexByGroup.set(entry.group, signalIndex + 1)
      const sourceAddress = getRowSourceAddress(entry)
      const sourceValues = valuesByType[entry.sourceRegisterType]
      return {
        index: index + 1,
        signalIndex,
        plcTagNumber: signalIndex + 1,
        group: entry.group,
        id: entry.id,
        tag: entry.tag,
        name: entry.name,
        displayName: displayNameOverrides[entry.id] ?? entry.name,
        address: entry.modbusRegister,
        spreadsheetSystemId: entry.systemId,
        spreadsheetTagName: entry.tag,
        modbusRegister: entry.modbusRegister,
        modbusOffset: entry.modbusOffset,
        unit: entry.unit || '--',
        access: getRowAccessText(entry),
        sourceAddress,
        sourceRegisterType: entry.sourceRegisterType,
        inlineForceMode: getRowInlineForceMode(entry),
        value: toSpreadsheetValue(entry, sourceValues?.[sourceAddress])
      }
    })
  }, [displayNameOverrides, spreadsheetRows, valuesByType])
  type ResolvedRow = (typeof rows)[number]
  type WagoIoCardSlot = {
    rowId: string
    row: ResolvedRow | null
    signalIndex: number
    plcTagNumber: number
    address: number
    registerType: WagoLiveRegisterType
    modbusRegister: number
  }

  const rowById = useMemo(() => {
    const nextMap = new Map<string, ResolvedRow>()

    rows.forEach((row) => {
      nextMap.set(row.id, row)
      nextMap.set(row.spreadsheetSystemId, row)
    })

    return nextMap
  }, [rows])

  const ioCardModules = useMemo(() => {
    const modules: Array<{
      key: string
      group: WagoMonitorGroupLabel
      code: string
      tone: WagoIoCardTone
      slots: WagoIoCardSlot[]
    }> = []

    WAGO_IO_CARD_MODULE_LAYOUT.forEach((moduleLayout) => {
      const parsedFirstRowId = parseIoCardRowId(moduleLayout.rowIds[0] ?? '')
      if (!parsedFirstRowId) {
        return
      }

      const slots = moduleLayout.rowIds.map((rowId) => {
        const row = rowById.get(rowId) ?? null
        const parsedRowId = parseIoCardRowId(rowId)
        const ordinal = parsedRowId?.ordinal ?? 1
        const registerType = parsedRowId
          ? getRegisterTypeFromSignalTypeCode(parsedRowId.code)
          : (row?.sourceRegisterType ?? 'input')
        const address = parsedRowId ? getIoCardRackAddress(parsedRowId.code, ordinal) : ordinal - 1

        return {
          rowId,
          row,
          signalIndex: row?.signalIndex ?? ordinal - 1,
          plcTagNumber: row?.plcTagNumber ?? ordinal,
          address,
          registerType,
          modbusRegister: row?.modbusRegister ?? getModbusRegisterBase(registerType) + address
        }
      })

      const primaryGroup =
        slots.find((slot) => slot.row !== null)?.row?.group ??
        getGroupFromSignalTypeCode(parsedFirstRowId.code)

      modules.push({
        key: moduleLayout.key,
        group: primaryGroup,
        code: getSignalTypeCode(primaryGroup),
        tone: getSignalTypeTone(primaryGroup),
        slots
      })
    })

    return modules
  }, [rowById])

  const ioCardSections = useMemo(() => {
    return IO_CARD_GROUP_ORDER.map((group) => {
      const groupRows = rows.filter((row) => row.group === group)
      const cards: Array<typeof groupRows> = []

      for (let index = 0; index < groupRows.length; index += 2) {
        cards.push(groupRows.slice(index, index + 2))
      }

      return {
        group,
        code: getSignalTypeCode(group),
        tone: getSignalTypeTone(group),
        cards,
        signalCount: groupRows.length
      }
    }).filter((section) => section.signalCount > 0)
  }, [rows])

  const ioCardSummaryCounts = useMemo(() => {
    if (ioCardModules.length === 0) {
      return {
        analogInputs: rows.filter((row) => row.group === 'Analog Input').length,
        digitalInputs: rows.filter((row) => row.group === 'Digital Input').length,
        digitalOutputs: rows.filter((row) => row.group === 'Digital Output').length,
        analogOutputs: rows.filter((row) => row.group === 'Analog Output').length,
        totalSignals: rows.length
      }
    }

    const counts = {
      analogInputs: 0,
      digitalInputs: 0,
      digitalOutputs: 0,
      analogOutputs: 0,
      totalSignals: 0
    }

    ioCardModules.forEach((module) => {
      counts.totalSignals += module.slots.length
      switch (module.group) {
        case 'Analog Input':
          counts.analogInputs += module.slots.length
          break
        case 'Digital Input':
          counts.digitalInputs += module.slots.length
          break
        case 'Digital Output':
          counts.digitalOutputs += module.slots.length
          break
        case 'Analog Output':
          counts.analogOutputs += module.slots.length
          break
      }
    })

    return counts
  }, [ioCardModules, rows])
  const rackAnalogModules = useMemo(
    () =>
      ioCardModules.filter(
        (module) => module.group === 'Analog Input' || module.group === 'Analog Output'
      ),
    [ioCardModules]
  )
  const digitalInputModules = useMemo(
    () => ioCardModules.filter((module) => module.group === 'Digital Input'),
    [ioCardModules]
  )
  const digitalOutputModules = useMemo(
    () => ioCardModules.filter((module) => module.group === 'Digital Output'),
    [ioCardModules]
  )
  const digitalInputDisplayRows = useMemo(
    () =>
      rows
        .filter((row) => row.group === 'Digital Input' && !/fail/i.test(row.tag))
        .slice(0, ioCardSummaryCounts.digitalInputs),
    [ioCardSummaryCounts.digitalInputs, rows]
  )

  const statusTone = deviceConnected ? 'ok' : isLoading ? 'warn' : 'off'
  const statusText = deviceConnected ? 'Live' : isLoading ? 'Reading...' : 'Read Error'
  const renameDraftTrimmed = renameDraft.trim()
  const getRenameTargetLabel = (target: WagoRenameTarget): string =>
    target.tag !== '--' ? target.tag : target.label

  const getIoCardDisplayRow = (
    slot: WagoIoCardSlot,
    group: WagoMonitorGroupLabel
  ): ResolvedRow | null => {
    if (group === 'Digital Input') {
      return digitalInputDisplayRows[slot.signalIndex] ?? slot.row
    }

    return slot.row
  }

  const buildRowRenameTarget = (row: (typeof rows)[number]): WagoRenameTarget => ({
    id: row.id,
    group: row.group,
    signalIndex: row.signalIndex,
    plcTagNumber: row.plcTagNumber,
    tag: row.tag,
    name: row.name,
    displayName: row.displayName,
    label: `${getSignalTypeCode(row.group)} ${formatSignalIndex(row.signalIndex)}`
  })

  const buildIoCardSlotRenameTarget = (
    slot: WagoIoCardSlot,
    moduleCode: string,
    group: WagoMonitorGroupLabel
  ): WagoRenameTarget => {
    const rackLabel = formatIoCardSlotLabel(moduleCode, slot.signalIndex)
    const row = getIoCardDisplayRow(slot, group)
    const defaultName = row?.name ?? 'Unmapped spare'
    const displayName = row?.displayName ?? displayNameOverrides[slot.rowId] ?? defaultName

    return {
      id: row?.id ?? slot.rowId,
      group,
      signalIndex: slot.signalIndex,
      plcTagNumber: slot.plcTagNumber,
      tag: row?.tag ?? '--',
      name: defaultName,
      displayName,
      label: rackLabel
    }
  }

  const clearRenameHold = () => {
    if (renameHoldTimerRef.current !== null) {
      window.clearTimeout(renameHoldTimerRef.current)
      renameHoldTimerRef.current = null
    }
    renameHoldPointerStartRef.current = null
  }

  const openRenameModal = (target: WagoRenameTarget) => {
    clearRenameHold()
    setRenameTarget(target)
    setRenameDraft(target.displayName)
    setRenameKeyboardVisible(false)
  }

  const closeRenameModal = () => {
    clearRenameHold()
    setRenameTarget(null)
    setRenameDraft('')
    setRenameKeyboardVisible(false)
  }

  const getRenameHoldHandlers = (target: WagoRenameTarget) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }

      clearRenameHold()
      renameHoldPointerStartRef.current = {
        x: event.clientX,
        y: event.clientY
      }
      renameHoldTimerRef.current = window.setTimeout(() => {
        renameHoldTimerRef.current = null
        renameHoldPointerStartRef.current = null
        openRenameModal(target)
      }, WAGO_RENAME_HOLD_MS)
    },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      const start = renameHoldPointerStartRef.current
      if (!start) {
        return
      }

      const deltaX = Math.abs(event.clientX - start.x)
      const deltaY = Math.abs(event.clientY - start.y)
      if (deltaX > 10 || deltaY > 10) {
        clearRenameHold()
      }
    },
    onPointerUp: clearRenameHold,
    onPointerLeave: clearRenameHold,
    onPointerCancel: clearRenameHold,
    onContextMenu: (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault()
      openRenameModal(target)
    },
    onDoubleClick: () => openRenameModal(target)
  })

  const handleRenameSave = () => {
    if (!renameTarget) {
      return
    }

    if (!renameDraftTrimmed || renameDraftTrimmed === renameTarget.name) {
      clearWagoDisplayNameOverride(renameTarget.id)
      showNotice(
        {
          tone: 'success',
          message: `${getRenameTargetLabel(renameTarget)} display name reset to default.`
        },
        3500
      )
      closeRenameModal()
      return
    }

    setWagoDisplayNameOverride(renameTarget.id, renameDraftTrimmed)
    showNotice(
      {
        tone: 'success',
        message: `${getRenameTargetLabel(renameTarget)} display name saved as "${renameDraftTrimmed}".`
      },
      3500
    )
    closeRenameModal()
  }

  const handleRenameReset = () => {
    if (!renameTarget) {
      return
    }

    clearWagoDisplayNameOverride(renameTarget.id)
    showNotice(
      {
        tone: 'success',
        message: `${getRenameTargetLabel(renameTarget)} display name reset to default.`
      },
      3500
    )
    closeRenameModal()
  }

  const getInlineAnalogDraft = (row: (typeof rows)[number]): string => {
    const draft = inlineForceDrafts[row.id]
    if (draft !== undefined) {
      return draft
    }

    if (row.value === null || row.value === undefined) {
      return ''
    }

    return String(row.value)
  }

  const handleInlineDigitalForce = async (row: (typeof rows)[number], nextValue: 0 | 1) => {
    setInlineForceRowId(row.id)
    try {
      const response = await writeWagoLiveCoil({
        deviceId: selectedMotor.deviceId,
        address: row.modbusRegister,
        value: nextValue
      })

      const nextReadback =
        response.readback_value ?? response.active_readback_value ?? response.requested_value
      setValuesByType((prev) => ({
        ...prev,
        coil: {
          ...prev.coil,
          [row.sourceAddress]: nextReadback
        }
      }))
      setDeviceConnected(response.connected)

      const readbackMessage =
        response.readback_value !== null && response.readback_value !== undefined
          ? ` Readback: ${formatValue(response.readback_value)}.`
          : ''
      showNotice(
        {
          tone: 'success',
          message: `${row.tag} (${response.modbus_register}) forced ${nextValue ? 'ON' : 'OFF'}.${readbackMessage}`
        },
        4000
      )
    } catch (error) {
      showNotice(
        {
          tone: 'error',
          message: getErrorMessage(error, `Failed to force ${row.tag}.`)
        },
        4000
      )
    } finally {
      setInlineForceRowId(null)
    }
  }

  const handleIoCardDigitalForce = async (slot: WagoIoCardSlot, nextValue: 0 | 1) => {
    setInlineForceRowId(slot.rowId)
    try {
      const response = await writeWagoLiveCoil({
        deviceId: selectedMotor.deviceId,
        address: slot.address,
        value: nextValue
      })

      const nextReadback =
        response.readback_value ?? response.active_readback_value ?? response.requested_value
      setValuesByType((prev) => ({
        ...prev,
        coil: {
          ...prev.coil,
          [slot.address]: nextReadback
        }
      }))
      setDeviceConnected(response.connected)
    } catch (error) {
      showNotice(
        {
          tone: 'error',
          message: getErrorMessage(error, `Failed to force rack coil ${slot.address}.`)
        },
        4000
      )
    } finally {
      setInlineForceRowId((current) => (current === slot.rowId ? null : current))
    }
  }

  const handleInlineAnalogForce = async (row: (typeof rows)[number]) => {
    const parsedValue = Number.parseFloat(getInlineAnalogDraft(row))
    if (!Number.isFinite(parsedValue)) {
      showNotice(
        {
          tone: 'error',
          message: `Enter a valid value for ${row.tag} before writing.`
        },
        4000
      )
      return
    }

    setInlineForceRowId(row.id)
    try {
      const response = await writeWagoLiveRegister({
        deviceId: selectedMotor.deviceId,
        address: row.modbusRegister,
        value: parsedValue
      })

      const nextReadback = response.readback_value ?? response.requested_value
      setValuesByType((prev) => ({
        ...prev,
        holding: {
          ...prev.holding,
          [row.sourceAddress]: nextReadback
        }
      }))
      setInlineForceDrafts((prev) => ({
        ...prev,
        [row.id]: String(nextReadback)
      }))
      setDeviceConnected(response.connected)

      const readbackMessage =
        response.readback_value !== null && response.readback_value !== undefined
          ? ` Readback: ${formatValue(response.readback_value)}.`
          : ''
      showNotice(
        {
          tone: 'success',
          message: `${row.tag} (${response.modbus_register}) written to ${response.requested_value}.${readbackMessage}`
        },
        4000
      )
    } catch (error) {
      showNotice(
        {
          tone: 'error',
          message: getErrorMessage(error, `Failed to write ${row.tag}.`)
        },
        4000
      )
    } finally {
      setInlineForceRowId(null)
    }
  }

  return (
    <PageContainer $embedded={embedded}>
      <TopBar>
        <TitleBlock>
          <Title as={embedded ? 'h2' : 'h1'}>WAGO I/O Monitor</Title>
          <Subtitle>
            Direct live reads and inline force controls for {selectedMotor.label} on WAGO rack{' '}
            {selectedMotorHost}.
          </Subtitle>
          <ControlRail>
            <SelectorGroup>
              {WAGO_LIVE_MOTOR_OPTIONS.map((option) => (
                <SelectorButton
                  key={option.deviceId}
                  type="button"
                  $active={option.scope === selectedMotorScope}
                  aria-pressed={option.scope === selectedMotorScope}
                  onClick={() => setSelectedMotorScope(option.scope)}
                >
                  {option.label}
                </SelectorButton>
              ))}
            </SelectorGroup>
            <SelectorGroup>
              <SelectorButton
                type="button"
                $active={activeTab === 'monitor'}
                aria-pressed={activeTab === 'monitor'}
                onClick={() => setActiveTab('monitor')}
              >
                Monitor
              </SelectorButton>
              <SelectorButton
                type="button"
                $active={activeTab === 'cards'}
                aria-pressed={activeTab === 'cards'}
                onClick={() => setActiveTab('cards')}
              >
                I/O Cards
              </SelectorButton>
            </SelectorGroup>
            <StatusGroup>
              <StatusBadge $tone={statusTone}>{statusText}</StatusBadge>
            </StatusGroup>
          </ControlRail>
        </TitleBlock>
      </TopBar>

      {activeTab === 'monitor' ? (
        <TableCard $embedded={embedded}>
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <HeadCell>#</HeadCell>
                  <HeadCell>Signal Type</HeadCell>
                  <HeadCell>Display Name</HeadCell>
                  <HeadCell>Address</HeadCell>
                  <HeadCell>PLC Tag</HeadCell>
                  <HeadCell>Signal Ref</HeadCell>
                  <HeadCell>Map #</HeadCell>
                  <HeadCell>Value</HeadCell>
                  <HeadCell>Unit</HeadCell>
                  <HeadCell>Access</HeadCell>
                  <HeadCell>Force</HeadCell>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const missingValue = row.value === null || row.value === undefined

                  return (
                    <Row key={row.id}>
                      <IndexCell>{row.index}</IndexCell>
                      <Cell>
                        <MetaText>{row.group}</MetaText>
                      </Cell>
                      <Cell>
                        <RenameableTextButton
                          type="button"
                          title={`Hold to rename the HMI label for ${row.tag}. PLC tag and logic stay unchanged.`}
                          {...getRenameHoldHandlers(buildRowRenameTarget(row))}
                        >
                          <Description>{row.displayName}</Description>
                        </RenameableTextButton>
                        <MetaText>PLC tag: {row.tag}</MetaText>
                      </Cell>
                      <Cell>
                        <MetaText>{row.address ?? '--'}</MetaText>
                      </Cell>
                      <Cell>
                        <Tag>{row.tag}</Tag>
                      </Cell>
                      <Cell>
                        {row.spreadsheetSystemId ? (
                          <>
                            <Description>
                              {getSignalTypeCode(row.group)} {formatSignalIndex(row.signalIndex)}
                            </Description>
                            <MetaText>
                              PLC #{row.plcTagNumber} · {row.spreadsheetSystemId}
                            </MetaText>
                          </>
                        ) : (
                          <MetaText>--</MetaText>
                        )}
                      </Cell>
                      <Cell>
                        {row.modbusRegister !== undefined ? (
                          <>
                            <Description>{row.modbusRegister}</Description>
                          </>
                        ) : (
                          <MetaText>--</MetaText>
                        )}
                      </Cell>
                      <Cell>
                        <ValueText $missing={missingValue}>{formatValue(row.value)}</ValueText>
                      </Cell>
                      <Cell>
                        <MetaText>{row.unit}</MetaText>
                      </Cell>
                      <Cell>
                        <MetaText>{row.access}</MetaText>
                      </Cell>
                      <Cell>
                        {row.inlineForceMode === 'digital-write' ? (
                          <InlineForceCell>
                            <InlineForceToggle
                              type="button"
                              disabled={inlineForceRowId === row.id}
                              $active={row.value === 1}
                              $disabled={inlineForceRowId === row.id}
                              aria-label={`Force ${row.tag} ${row.value === 1 ? 'off' : 'on'}`}
                              onClick={() => {
                                void handleInlineDigitalForce(row, row.value === 1 ? 0 : 1)
                              }}
                            >
                              {row.value === 1 ? '✓' : ''}
                            </InlineForceToggle>
                            <InlineForceHint>
                              {inlineForceRowId === row.id
                                ? 'Writing'
                                : row.value === 1
                                  ? 'ON'
                                  : 'OFF'}
                            </InlineForceHint>
                          </InlineForceCell>
                        ) : row.inlineForceMode === 'digital-readonly' ? (
                          <InlineForceCell title="Discrete input rows are read-only on this WAGO rack.">
                            <InlineForceToggle
                              type="button"
                              disabled
                              $active={row.value === 1}
                              $disabled
                              $readOnly
                              aria-label={`${row.tag} is read only`}
                            >
                              {row.value === 1 ? '✓' : ''}
                            </InlineForceToggle>
                            <InlineForceHint $tone="warn">RO</InlineForceHint>
                          </InlineForceCell>
                        ) : row.inlineForceMode === 'analog-write' ? (
                          <InlineForceCell>
                            <InlineForceValue
                              type="number"
                              step="any"
                              value={getInlineAnalogDraft(row)}
                              onChange={(event) => {
                                const { value } = event.target
                                setInlineForceDrafts((prev) => ({
                                  ...prev,
                                  [row.id]: value
                                }))
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                  event.preventDefault()
                                  void handleInlineAnalogForce(row)
                                }
                              }}
                              disabled={inlineForceRowId === row.id}
                              aria-label={`Write analog value for ${row.tag}`}
                            />
                            <InlineForceWriteButton
                              type="button"
                              disabled={inlineForceRowId === row.id}
                              onClick={() => {
                                void handleInlineAnalogForce(row)
                              }}
                            >
                              {inlineForceRowId === row.id ? 'Writing' : 'Write'}
                            </InlineForceWriteButton>
                          </InlineForceCell>
                        ) : (
                          <InlineForceCell title="Input register rows are read-only on this WAGO rack.">
                            <InlineForceValue
                              type="number"
                              step="any"
                              value={
                                row.value === null || row.value === undefined
                                  ? ''
                                  : String(row.value)
                              }
                              disabled
                              readOnly
                              aria-label={`${row.tag} is read only`}
                            />
                            <InlineForceHint $tone="warn">RO</InlineForceHint>
                          </InlineForceCell>
                        )}
                      </Cell>
                    </Row>
                  )
                })}
              </tbody>
            </Table>
          </TableScroll>
        </TableCard>
      ) : activeTab === 'cards' ? (
        <TableCard $embedded={embedded}>
          <IoCardsScroll>
            {ioCardModules.length > 0 ? (
              <IoSection>
                <IoSectionHeader>
                  <IoSectionTitleBlock>
                    <IoSectionTitle>Rack Layout</IoSectionTitle>
                    <IoSectionDescription>
                      Cards follow the physical WAGO rack from left to right. Each bulb lights when
                      the live signal is high for digital points or non-zero for analog points.
                    </IoSectionDescription>
                  </IoSectionTitleBlock>
                  <IoSectionMeta>
                    <SummaryChip>{ioCardSummaryCounts.totalSignals} signals</SummaryChip>
                    <SummaryChip>{ioCardModules.length} cards</SummaryChip>
                  </IoSectionMeta>
                </IoSectionHeader>

                <IoCardGrid>
                  {rackAnalogModules.map((module) => (
                    <IoModuleCard key={module.key} $tone={module.tone}>
                      <IoModuleHeader $tone={module.tone}>
                        {[0, 1].map((slotIndex) => {
                          const slot = module.slots[slotIndex]
                          const slotValue =
                            slot && valuesByType[slot.registerType]
                              ? (valuesByType[slot.registerType][slot.address] ?? null)
                              : null
                          const active = slot
                            ? isRegisterValueActive(slot.registerType, slotValue)
                            : false
                          return (
                            <IoModuleHeaderSlot
                              key={`${module.key}-${slotIndex}`}
                              $tone={module.tone}
                              $inactive={!slot}
                            >
                              <span>
                                {slot
                                  ? formatIoCardSlotLabel(module.code, slot.signalIndex)
                                  : `${module.code} --`}
                              </span>
                              {slot ? <IoBulb $active={active} /> : null}
                            </IoModuleHeaderSlot>
                          )
                        })}
                      </IoModuleHeader>

                      <IoModuleChannels>
                        {module.slots.map((slot) => {
                          const row = slot.row
                          const slotValue = valuesByType[slot.registerType][slot.address] ?? null
                          const pointLabel = formatIoCardPointLabel(module.code, slot.signalIndex)
                          const rackLabel = formatIoCardSlotLabel(module.code, slot.signalIndex)
                          const slotDisplayName =
                            row?.displayName ?? displayNameOverrides[slot.rowId] ?? 'Unmapped spare'
                          const renameTargetForSlot = buildIoCardSlotRenameTarget(
                            slot,
                            module.code,
                            module.group
                          )
                          if (!row) {
                            const active = isRegisterValueActive(slot.registerType, slotValue)

                            return (
                              <IoChannel key={slot.rowId}>
                                <IoChannelHeader>
                                  <IoChannelTitleBlock>
                                    <RenameableTextButton
                                      type="button"
                                      title={`Hold to rename the HMI label for ${rackLabel}. Rack slot mapping stays unchanged.`}
                                      {...getRenameHoldHandlers(renameTargetForSlot)}
                                    >
                                      <IoChannelName>{slotDisplayName}</IoChannelName>
                                    </RenameableTextButton>
                                  </IoChannelTitleBlock>
                                </IoChannelHeader>
                                {SHOW_UNMAPPED_RACK_LABEL && (
                                  <RenameableTextButton
                                    type="button"
                                    title={`Hold to rename the HMI label for ${rackLabel}. Rack slot mapping stays unchanged.`}
                                    {...getRenameHoldHandlers(renameTargetForSlot)}
                                  >
                                    <IoChannelName>
                                      {formatIoCardSignalLabel(module.code, slot.signalIndex)} ·
                                      Unmapped spare
                                    </IoChannelName>
                                  </RenameableTextButton>
                                )}
                                <IoChannelMeta hidden>
                                  <span>Point: {pointLabel}</span>
                                </IoChannelMeta>
                                <IoChannelValueRow>
                                  <IoChannelState $active={active}>
                                    {getSignalStateLabel({
                                      sourceRegisterType: slot.registerType,
                                      value: slotValue
                                    })}
                                  </IoChannelState>
                                  <IoChannelValue $active={active}>
                                    {formatValue(slotValue)}
                                  </IoChannelValue>
                                </IoChannelValueRow>
                                {slot.registerType === 'coil' ? (
                                  <InlineForceCell>
                                    <InlineForceToggle
                                      type="button"
                                      disabled={inlineForceRowId === slot.rowId}
                                      $active={slotValue === 1}
                                      $disabled={inlineForceRowId === slot.rowId}
                                      aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                      onClick={() => {
                                        void handleIoCardDigitalForce(slot, slotValue === 1 ? 0 : 1)
                                      }}
                                    >
                                      {slotValue === 1 ? '✓' : ''}
                                    </InlineForceToggle>
                                    <InlineForceHint>
                                      {inlineForceRowId === slot.rowId
                                        ? 'Writing'
                                        : slotValue === 1
                                          ? 'ON'
                                          : 'OFF'}
                                    </InlineForceHint>
                                  </InlineForceCell>
                                ) : null}
                              </IoChannel>
                            )
                          }

                          const cardLinkedRow = {
                            ...row,
                            sourceAddress: slot.address,
                            sourceRegisterType: slot.registerType,
                            modbusRegister: slot.modbusRegister,
                            value: slotValue
                          }
                          const active = isSignalActive(cardLinkedRow)
                          return (
                            <IoChannel key={row.id}>
                              <IoChannelHeader>
                                <IoChannelTitleBlock>
                                  <RenameableTextButton
                                    type="button"
                                    title={`Hold to rename the HMI label for ${row.tag}. PLC tag and logic stay unchanged.`}
                                    {...getRenameHoldHandlers(renameTargetForSlot)}
                                  >
                                    <IoChannelName>{slotDisplayName}</IoChannelName>
                                  </RenameableTextButton>
                                </IoChannelTitleBlock>
                              </IoChannelHeader>

                              <IoChannelMeta hidden>
                                <span>Point: {pointLabel}</span>
                              </IoChannelMeta>

                              <IoChannelValueRow>
                                <IoChannelState $active={active}>
                                  {getSignalStateLabel(cardLinkedRow)}
                                </IoChannelState>
                                <IoChannelValue $active={active}>
                                  {formatValue(slotValue)}
                                  {row.unit && row.unit !== 'Bool' ? ` ${row.unit}` : ''}
                                </IoChannelValue>
                              </IoChannelValueRow>
                              {slot.registerType === 'coil' ? (
                                <InlineForceCell>
                                  <InlineForceToggle
                                    type="button"
                                    disabled={inlineForceRowId === slot.rowId}
                                    $active={slotValue === 1}
                                    $disabled={inlineForceRowId === slot.rowId}
                                    aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                    onClick={() => {
                                      void handleIoCardDigitalForce(slot, slotValue === 1 ? 0 : 1)
                                    }}
                                  >
                                    {slotValue === 1 ? '✓' : ''}
                                  </InlineForceToggle>
                                  <InlineForceHint>
                                    {inlineForceRowId === slot.rowId
                                      ? 'Writing'
                                      : slotValue === 1
                                        ? 'ON'
                                        : 'OFF'}
                                  </InlineForceHint>
                                </InlineForceCell>
                              ) : null}
                            </IoChannel>
                          )
                        })}
                      </IoModuleChannels>
                    </IoModuleCard>
                  ))}
                </IoCardGrid>
                {rackAnalogModules.length > 0 && digitalInputModules.length > 0 ? (
                  <IoSectionDivider />
                ) : null}
                {digitalInputModules.length > 0 ? (
                  <IoCardGrid>
                    {digitalInputModules.map((module) => (
                      <IoModuleCard key={module.key} $tone={module.tone}>
                        <IoModuleHeader $tone={module.tone}>
                          {[0, 1].map((slotIndex) => {
                            const slot = module.slots[slotIndex]
                            const slotValue =
                              slot && valuesByType[slot.registerType]
                                ? (valuesByType[slot.registerType][slot.address] ?? null)
                                : null
                            const active = slot
                              ? isRegisterValueActive(slot.registerType, slotValue)
                              : false
                            return (
                              <IoModuleHeaderSlot
                                key={`${module.key}-${slotIndex}`}
                                $tone={module.tone}
                                $inactive={!slot}
                              >
                                <span>
                                  {slot
                                    ? formatIoCardSlotLabel(module.code, slot.signalIndex)
                                    : `${module.code} --`}
                                </span>
                                {slot ? <IoBulb $active={active} /> : null}
                              </IoModuleHeaderSlot>
                            )
                          })}
                        </IoModuleHeader>

                        <IoModuleChannels>
                          {module.slots.map((slot) => {
                            const row = getIoCardDisplayRow(slot, module.group)
                            const slotValue = valuesByType[slot.registerType][slot.address] ?? null
                            const pointLabel = formatIoCardPointLabel(module.code, slot.signalIndex)
                            const rackLabel = formatIoCardSlotLabel(module.code, slot.signalIndex)
                            const slotDisplayName =
                              row?.displayName ??
                              displayNameOverrides[slot.rowId] ??
                              'Unmapped spare'
                            const renameTargetForSlot = buildIoCardSlotRenameTarget(
                              slot,
                              module.code,
                              module.group
                            )
                            if (!row) {
                              const active = isRegisterValueActive(slot.registerType, slotValue)

                              return (
                                <IoChannel key={slot.rowId}>
                                  <IoChannelHeader>
                                    <IoChannelTitleBlock>
                                      <RenameableTextButton
                                        type="button"
                                        title={`Hold to rename the HMI label for ${rackLabel}. Rack slot mapping stays unchanged.`}
                                        {...getRenameHoldHandlers(renameTargetForSlot)}
                                      >
                                        <IoChannelName>{slotDisplayName}</IoChannelName>
                                      </RenameableTextButton>
                                    </IoChannelTitleBlock>
                                  </IoChannelHeader>
                                  <IoChannelMeta>
                                    <span>{formatDigitalOutputReadAddressLabel(slot.address)}</span>
                                  </IoChannelMeta>
                                  <IoChannelMeta hidden>
                                    <span>Point: {pointLabel}</span>
                                  </IoChannelMeta>
                                  <IoChannelValueRow>
                                    <IoChannelState $active={active}>
                                      {getSignalStateLabel({
                                        sourceRegisterType: slot.registerType,
                                        value: slotValue
                                      })}
                                    </IoChannelState>
                                    <IoChannelValue $active={active}>
                                      {formatValue(slotValue)}
                                    </IoChannelValue>
                                  </IoChannelValueRow>
                                  {slot.registerType === 'coil' ? (
                                    <InlineForceCell>
                                      <InlineForceToggle
                                        type="button"
                                        disabled={inlineForceRowId === slot.rowId}
                                        $active={slotValue === 1}
                                        $disabled={inlineForceRowId === slot.rowId}
                                        aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                        onClick={() => {
                                          void handleIoCardDigitalForce(
                                            slot,
                                            slotValue === 1 ? 0 : 1
                                          )
                                        }}
                                      >
                                        {slotValue === 1 ? 'âœ“' : ''}
                                      </InlineForceToggle>
                                      <InlineForceHint>
                                        {inlineForceRowId === slot.rowId
                                          ? 'Writing'
                                          : slotValue === 1
                                            ? 'ON'
                                            : 'OFF'}
                                      </InlineForceHint>
                                    </InlineForceCell>
                                  ) : null}
                                </IoChannel>
                              )
                            }

                            const cardLinkedRow = {
                              ...row,
                              sourceAddress: slot.address,
                              sourceRegisterType: slot.registerType,
                              modbusRegister: slot.modbusRegister,
                              value: slotValue
                            }
                            const active = isSignalActive(cardLinkedRow)
                            return (
                              <IoChannel key={row.id}>
                                <IoChannelHeader>
                                  <IoChannelTitleBlock>
                                    <RenameableTextButton
                                      type="button"
                                      title={`Hold to rename the HMI label for ${row.tag}. PLC tag and logic stay unchanged.`}
                                      {...getRenameHoldHandlers(renameTargetForSlot)}
                                    >
                                      <IoChannelName>{slotDisplayName}</IoChannelName>
                                    </RenameableTextButton>
                                  </IoChannelTitleBlock>
                                </IoChannelHeader>
                                <IoChannelMeta>
                                  <span>{formatDigitalOutputReadAddressLabel(slot.address)}</span>
                                </IoChannelMeta>

                                <IoChannelMeta hidden>
                                  <span>Point: {pointLabel}</span>
                                </IoChannelMeta>

                                <IoChannelValueRow>
                                  <IoChannelState $active={active}>
                                    {getSignalStateLabel(cardLinkedRow)}
                                  </IoChannelState>
                                  <IoChannelValue $active={active}>
                                    {formatValue(slotValue)}
                                    {row.unit && row.unit !== 'Bool' ? ` ${row.unit}` : ''}
                                  </IoChannelValue>
                                </IoChannelValueRow>
                                {slot.registerType === 'coil' ? (
                                  <InlineForceCell>
                                    <InlineForceToggle
                                      type="button"
                                      disabled={inlineForceRowId === slot.rowId}
                                      $active={slotValue === 1}
                                      $disabled={inlineForceRowId === slot.rowId}
                                      aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                      onClick={() => {
                                        void handleIoCardDigitalForce(slot, slotValue === 1 ? 0 : 1)
                                      }}
                                    >
                                      {slotValue === 1 ? 'âœ“' : ''}
                                    </InlineForceToggle>
                                    <InlineForceHint>
                                      {inlineForceRowId === slot.rowId
                                        ? 'Writing'
                                        : slotValue === 1
                                          ? 'ON'
                                          : 'OFF'}
                                    </InlineForceHint>
                                  </InlineForceCell>
                                ) : null}
                              </IoChannel>
                            )
                          })}
                        </IoModuleChannels>
                      </IoModuleCard>
                    ))}
                  </IoCardGrid>
                ) : null}
                {(digitalInputModules.length > 0 || rackAnalogModules.length > 0) &&
                digitalOutputModules.length > 0 ? (
                  <IoSectionDivider />
                ) : null}
                {digitalOutputModules.length > 0 ? (
                  <IoCardGrid>
                    {digitalOutputModules.map((module) => (
                      <IoModuleCard key={module.key} $tone={module.tone}>
                        <IoModuleHeader $tone={module.tone}>
                          {[0, 1].map((slotIndex) => {
                            const slot = module.slots[slotIndex]
                            const statusAddress = slot?.row?.sourceAddress ?? slot?.address ?? null
                            const slotValue =
                              slot && statusAddress !== null && valuesByType[slot.registerType]
                                ? (valuesByType[slot.registerType][statusAddress] ?? null)
                                : null
                            const active = slot
                              ? isRegisterValueActive(slot.registerType, slotValue)
                              : false
                            return (
                              <IoModuleHeaderSlot
                                key={`${module.key}-${slotIndex}`}
                                $tone={module.tone}
                                $inactive={!slot}
                              >
                                <span>
                                  {slot
                                    ? formatIoCardSlotLabel(module.code, slot.signalIndex)
                                    : `${module.code} --`}
                                </span>
                                {slot ? <IoBulb $active={active} /> : null}
                              </IoModuleHeaderSlot>
                            )
                          })}
                        </IoModuleHeader>

                        <IoModuleChannels>
                          {module.slots.map((slot) => {
                            const row = slot.row
                            const statusAddress = row?.sourceAddress ?? slot.address
                            const slotValue = valuesByType[slot.registerType][statusAddress] ?? null
                            const pointLabel = formatIoCardPointLabel(module.code, slot.signalIndex)
                            const rackLabel = formatIoCardSlotLabel(module.code, slot.signalIndex)
                            const slotDisplayName =
                              row?.displayName ??
                              displayNameOverrides[slot.rowId] ??
                              'Unmapped spare'
                            const renameTargetForSlot = buildIoCardSlotRenameTarget(
                              slot,
                              module.code,
                              module.group
                            )
                            if (!row) {
                              const active = isRegisterValueActive(slot.registerType, slotValue)

                              return (
                                <IoChannel key={slot.rowId}>
                                  <IoChannelHeader>
                                    <IoChannelTitleBlock>
                                      <RenameableTextButton
                                        type="button"
                                        title={`Hold to rename the HMI label for ${rackLabel}. Rack slot mapping stays unchanged.`}
                                        {...getRenameHoldHandlers(renameTargetForSlot)}
                                      >
                                        <IoChannelName>{slotDisplayName}</IoChannelName>
                                      </RenameableTextButton>
                                    </IoChannelTitleBlock>
                                  </IoChannelHeader>
                                  <IoChannelMeta hidden>
                                    <span>Point: {pointLabel}</span>
                                  </IoChannelMeta>
                                  <IoChannelValueRow>
                                    <IoChannelState $active={active}>
                                      {getSignalStateLabel({
                                        sourceRegisterType: slot.registerType,
                                        value: slotValue
                                      })}
                                    </IoChannelState>
                                    <IoChannelValue $active={active}>
                                      {formatValue(slotValue)}
                                    </IoChannelValue>
                                  </IoChannelValueRow>
                                  {slot.registerType === 'coil' ? (
                                    <InlineForceCell>
                                      <InlineForceToggle
                                        type="button"
                                        disabled={inlineForceRowId === slot.rowId}
                                        $active={slotValue === 1}
                                        $disabled={inlineForceRowId === slot.rowId}
                                        aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                        onClick={() => {
                                          void handleIoCardDigitalForce(
                                            slot,
                                            slotValue === 1 ? 0 : 1
                                          )
                                        }}
                                      >
                                        {slotValue === 1 ? '✓' : ''}
                                      </InlineForceToggle>
                                      <InlineForceHint>
                                        {inlineForceRowId === slot.rowId
                                          ? 'Writing'
                                          : slotValue === 1
                                            ? 'ON'
                                            : 'OFF'}
                                      </InlineForceHint>
                                    </InlineForceCell>
                                  ) : null}
                                </IoChannel>
                              )
                            }

                            const cardLinkedRow = {
                              ...row,
                              sourceAddress: statusAddress,
                              sourceRegisterType: slot.registerType,
                              modbusRegister: slot.modbusRegister,
                              value: slotValue
                            }
                            const active = isSignalActive(cardLinkedRow)
                            return (
                              <IoChannel key={row.id}>
                                <IoChannelHeader>
                                  <IoChannelTitleBlock>
                                    <RenameableTextButton
                                      type="button"
                                      title={`Hold to rename the HMI label for ${row.tag}. PLC tag and logic stay unchanged.`}
                                      {...getRenameHoldHandlers(renameTargetForSlot)}
                                    >
                                      <IoChannelName>{slotDisplayName}</IoChannelName>
                                    </RenameableTextButton>
                                  </IoChannelTitleBlock>
                                </IoChannelHeader>

                                <IoChannelMeta hidden>
                                  <span>Point: {pointLabel}</span>
                                </IoChannelMeta>

                                <IoChannelValueRow>
                                  <IoChannelState $active={active}>
                                    {getSignalStateLabel(cardLinkedRow)}
                                  </IoChannelState>
                                  <IoChannelValue $active={active}>
                                    {formatValue(slotValue)}
                                    {row.unit && row.unit !== 'Bool' ? ` ${row.unit}` : ''}
                                  </IoChannelValue>
                                </IoChannelValueRow>
                                {slot.registerType === 'coil' ? (
                                  <InlineForceCell>
                                    <InlineForceToggle
                                      type="button"
                                      disabled={inlineForceRowId === slot.rowId}
                                      $active={slotValue === 1}
                                      $disabled={inlineForceRowId === slot.rowId}
                                      aria-label={`Force rack coil ${slot.address} ${slotValue === 1 ? 'off' : 'on'}`}
                                      onClick={() => {
                                        void handleIoCardDigitalForce(slot, slotValue === 1 ? 0 : 1)
                                      }}
                                    >
                                      {slotValue === 1 ? '✓' : ''}
                                    </InlineForceToggle>
                                    <InlineForceHint>
                                      {inlineForceRowId === slot.rowId
                                        ? 'Writing'
                                        : slotValue === 1
                                          ? 'ON'
                                          : 'OFF'}
                                    </InlineForceHint>
                                  </InlineForceCell>
                                ) : null}
                              </IoChannel>
                            )
                          })}
                        </IoModuleChannels>
                      </IoModuleCard>
                    ))}
                  </IoCardGrid>
                ) : null}
              </IoSection>
            ) : (
              ioCardSections.map((section) => (
                <IoSection key={section.group}>
                  <IoSectionHeader>
                    <IoSectionTitleBlock>
                      <IoSectionTitle>{section.group}</IoSectionTitle>
                      <IoSectionDescription>
                        Paired I/O cards in rack order. Each bulb lights when the live signal is
                        high for digital points or non-zero for analog points.
                      </IoSectionDescription>
                    </IoSectionTitleBlock>
                    <IoSectionMeta>
                      <SummaryChip>{section.signalCount} signals</SummaryChip>
                      <SummaryChip>{section.cards.length} cards</SummaryChip>
                    </IoSectionMeta>
                  </IoSectionHeader>

                  <IoCardGrid>
                    {section.cards.map((cardRows) => (
                      <IoModuleCard
                        key={`${section.group}-${cardRows[0]?.id ?? 'empty'}`}
                        $tone={section.tone}
                      >
                        <IoModuleHeader $tone={section.tone}>
                          {[0, 1].map((slotIndex) => {
                            const row = cardRows[slotIndex]
                            const active = row ? isSignalActive(row) : false
                            return (
                              <IoModuleHeaderSlot
                                key={`${section.group}-${cardRows[0]?.id ?? 'empty'}-${slotIndex}`}
                                $tone={section.tone}
                                $inactive={!row}
                              >
                                <span>
                                  {row
                                    ? `${section.code} ${formatSignalIndex(row.signalIndex)}`
                                    : `${section.code} --`}
                                </span>
                                {row ? <IoBulb $active={active} /> : null}
                              </IoModuleHeaderSlot>
                            )
                          })}
                        </IoModuleHeader>

                        <IoModuleChannels>
                          {cardRows.map((row) => {
                            const active = isSignalActive(row)
                            return (
                              <IoChannel key={row.id}>
                                <RenameableTextButton
                                  type="button"
                                  title={`Hold to rename the HMI label for ${row.tag}. PLC tag and logic stay unchanged.`}
                                  {...getRenameHoldHandlers(buildRowRenameTarget(row))}
                                >
                                  <IoChannelName>{row.displayName}</IoChannelName>
                                </RenameableTextButton>

                                <IoChannelMeta hidden>
                                  <span>
                                    Point: {formatIoCardSignalLabel(section.code, row.signalIndex)}
                                  </span>
                                </IoChannelMeta>

                                <IoChannelValueRow>
                                  <IoChannelState $active={active}>
                                    {getSignalStateLabel(row)}
                                  </IoChannelState>
                                  <IoChannelValue $active={active}>
                                    {formatValue(row.value)}
                                    {row.unit && row.unit !== 'Bool' ? ` ${row.unit}` : ''}
                                  </IoChannelValue>
                                </IoChannelValueRow>
                              </IoChannel>
                            )
                          })}
                        </IoModuleChannels>
                      </IoModuleCard>
                    ))}
                  </IoCardGrid>
                </IoSection>
              ))
            )}
          </IoCardsScroll>
        </TableCard>
      ) : null}

      <ModalBase
        isOpen={renameTarget !== null}
        onRequestClose={closeRenameModal}
        width={560}
        ariaLabel="Rename WAGO variable"
      >
        <RenameModalBody>
          <RenameModalTitle>Edit Display Name</RenameModalTitle>
          <RenameModalText>
            Hold any variable name in the WAGO monitor to edit its HMI label. This only changes the
            display name in the app and does not change the PLC tag, logic, or Modbus mapping.
          </RenameModalText>
          {renameTarget ? (
            <>
              <SummaryChip>
                {renameTarget.group} · {getSignalTypeCode(renameTarget.group)}{' '}
                {formatSignalIndex(renameTarget.signalIndex)} · PLC #{renameTarget.plcTagNumber}
              </SummaryChip>
              <RenameModalText>Original PLC tag: {renameTarget.tag}</RenameModalText>
              <RenameModalField>
                <RenameModalLabel>Display Name</RenameModalLabel>
                <RenameModalInput
                  type="text"
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  onFocus={() => {
                    if (shouldUseVirtualKeyboard) {
                      setRenameKeyboardVisible(true)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleRenameSave()
                    }
                  }}
                  placeholder={renameTarget.name}
                />
              </RenameModalField>
            </>
          ) : null}
        </RenameModalBody>
        <RenameModalActions>
          <RenameModalButton type="button" onClick={closeRenameModal}>
            Cancel
          </RenameModalButton>
          <RenameModalButton
            type="button"
            $tone="danger"
            onClick={handleRenameReset}
            disabled={!renameTarget || renameTarget.displayName === renameTarget.name}
          >
            Reset
          </RenameModalButton>
          <RenameModalButton
            type="button"
            $tone="primary"
            onClick={handleRenameSave}
            disabled={!renameTarget}
          >
            Save
          </RenameModalButton>
        </RenameModalActions>
      </ModalBase>

      <VirtualKeyboard
        visible={shouldUseVirtualKeyboard && renameKeyboardVisible && renameTarget !== null}
        mode="text"
        initialValue={renameDraft}
        label={
          renameTarget ? `Rename ${getRenameTargetLabel(renameTarget)}` : 'Rename WAGO variable'
        }
        onConfirm={(value) => {
          setRenameDraft(value)
          setRenameKeyboardVisible(false)
        }}
        onCancel={() => setRenameKeyboardVisible(false)}
      />
    </PageContainer>
  )
}

const WagoLiveScreen = () => {
  return (
    <ScreenLayout>
      <WagoLivePanel />
    </ScreenLayout>
  )
}

export default WagoLiveScreen
