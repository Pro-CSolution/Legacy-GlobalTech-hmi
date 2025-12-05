import fs from 'fs'
import path from 'path'
import yaml from 'yaml'

const isIdentifier = (key: string): boolean => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)

const escapeString = (value: string): string => value.replace(/'/g, "\\'")

const quoteString = (value: string): string => `'${escapeString(value)}'`

const formatKey = (key: string): string => (isIdentifier(key) ? key : quoteString(key))

const formatArray = (items: string[], indent = 0): string => {
  const pad = ' '.repeat(indent)
  if (!items.length) return `${pad}[] as const`
  if (items.length <= 3) return `${pad}[${items.join(', ')}] as const`
  const inner = ' '.repeat(indent + 2)
  return `${pad}[\n${inner}${items.join(`,\n${inner}`)}\n${pad}] as const`
}

const formatStringArray = (items: string[], indent = 0): string =>
  formatArray(
    items.map((s) => quoteString(s)),
    indent
  )

const formatStringArrayBlock = (items: string[], baseIndent = 0): string => {
  const pad = ' '.repeat(baseIndent)
  const inner = ' '.repeat(baseIndent + 2)
  if (!items.length) return `${pad}[] as const`
  return `${pad}[\n${inner}${items.map((s) => quoteString(s)).join(`,\n${inner}`)}\n${pad}] as const`
}

const formatRange = (range?: { min?: number; max?: number }, indent = 0): string => {
  if (!range || (range.min === undefined && range.max === undefined)) return ''
  const pad = ' '.repeat(indent)
  const lines: string[] = []
  lines.push(`${pad}range: {`)
  if (range.min !== undefined) lines.push(`${pad}  min: ${range.min},`)
  if (range.max !== undefined) lines.push(`${pad}  max: ${range.max},`)
  lines.push(`${pad}},`)
  return lines.join('\n')
}

const formatAttributes = (attrs?: string[], indent = 0): string => {
  if (!attrs || !attrs.length) return ''
  return `${' '.repeat(indent)}attributes: [${attrs.map((a) => quoteString(a)).join(', ')}] as const`
}

type DevicesFile = {
  devices?: Array<{
    id?: string
    critical_parameters?: string[]
  }>
}

type ParameterEntry = {
  id?: string
  name?: string
  unit?: string
  menu?: number
  description?: string
  alias?: string
  range_numeric?: { min?: number; max?: number }
  attributes?: string[]
}

const resolveBackendRoot = (): string => {
  const envRoot = process.env.VITE_BACKEND_ROOT
  if (envRoot && envRoot.trim().length > 0) {
    return path.isAbsolute(envRoot) ? envRoot : path.resolve(envRoot)
  }
  return path.resolve(process.cwd(), '..', 'GlobalTech-Backend')
}

const loadDevices = (devicesPath: string): DevicesFile => {
  const raw = fs.readFileSync(devicesPath, 'utf-8')
  return yaml.parse(raw) as DevicesFile
}

const loadParameters = (parametersPath: string): ParameterEntry[] => {
  const raw = fs.readFileSync(parametersPath, 'utf-8')
  return JSON.parse(raw) as ParameterEntry[]
}

const ensureDir = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const main = (): void => {
  const backendRoot = resolveBackendRoot()
  const devicesPath = path.join(backendRoot, 'config', 'devices.yaml')
  const parametersPath = path.join(backendRoot, 'parameters.json')

  if (!fs.existsSync(devicesPath)) {
    throw new Error(`devices.yaml no encontrado en ${devicesPath}`)
  }
  if (!fs.existsSync(parametersPath)) {
    throw new Error(`parameters.json no encontrado en ${parametersPath}`)
  }

  const devicesFile = loadDevices(devicesPath)
  const parameters = loadParameters(parametersPath)

  const parameterMetaMap = new Map<string, ParameterEntry>()
  parameters.forEach((p) => {
    if (p.id) {
      parameterMetaMap.set(p.id, p)
    }
  })

  const deviceIds = new Set<string>()
  const parameterIds = new Set<string>()
  const deviceParameters: Record<string, string[]> = {}

  devicesFile.devices?.forEach((device) => {
    if (!device.id) return
    deviceIds.add(device.id)
    const crit = (device.critical_parameters || []).filter(Boolean)
    const unique = Array.from(new Set(crit))
    deviceParameters[device.id] = unique
    unique.forEach((pid) => parameterIds.add(pid))
  })

  const sortedDeviceIds = Array.from(deviceIds).sort()
  const sortedParameterIds = Array.from(parameterIds).sort()

  const parameterMetaEntries = sortedParameterIds.map((pid) => {
    const meta = parameterMetaMap.get(pid) || { id: pid }
    const range = meta.range_numeric
      ? { min: meta.range_numeric.min, max: meta.range_numeric.max }
      : undefined
    const attributes = Array.isArray(meta.attributes) ? meta.attributes : undefined
    return [
      pid,
      {
        id: pid,
        alias: meta.alias,
        name: meta.name,
        unit: meta.unit,
        menu: meta.menu,
        description: meta.description,
        range,
        attributes
      }
    ] as const
  })

  const outDir = path.join(process.cwd(), 'src', 'renderer', 'src', 'types', 'generated')
  ensureDir(outDir)
  const outPath = path.join(outDir, 'devices.ts')

  const fileHeader = `// AUTO-GENERATED FILE - DO NOT EDIT
// Fuente: config/devices.yaml y parameters.json
// Ejecutar: bun run generate:types
`

  const deviceIdsLiteral = `export const DEVICE_IDS = ${formatStringArray(sortedDeviceIds, 0)}`
  const parameterIdsLiteral = `export const PARAMETER_IDS = ${formatStringArray(sortedParameterIds, 0)}`

  const deviceParamEntries = Object.entries(deviceParameters).map(
    ([deviceId, params], idx, arr) => {
      const suffix = idx === arr.length - 1 ? '' : ','
      const arrLines = params.map((p) => `    ${quoteString(p)}`).join(',\n')
      const arrayBlock = `[\n${arrLines}\n  ] as const`
      return `  ${formatKey(deviceId)}: ${arrayBlock}${suffix}`
    }
  )
  const deviceParamsLiteral = `export const DEVICE_PARAMETERS: Record<DeviceId, ParameterId[]> = {\n${deviceParamEntries.join(
    '\n'
  )}\n} as const`

  const parameterMetaLiteral = `export const PARAMETER_META: Record<ParameterId, ParameterMeta> = {\n${parameterMetaEntries
    .map(([pid, meta], idx, arr) => {
      const props: string[] = []
      props.push(`id: ${quoteString(pid)}`)
      if (meta.alias) props.push(`alias: ${quoteString(meta.alias)}`)
      if (meta.name) props.push(`name: ${quoteString(meta.name)}`)
      if (meta.unit !== undefined && meta.unit !== null)
        props.push(`unit: ${quoteString(String(meta.unit))}`)
      if (meta.menu !== undefined) props.push(`menu: ${meta.menu}`)
      if (meta.description) props.push(`description: ${quoteString(meta.description)}`)
      if (meta.range) {
        const rangeParts: string[] = []
        if (meta.range.min !== undefined) rangeParts.push(`min: ${meta.range.min}`)
        if (meta.range.max !== undefined) rangeParts.push(`max: ${meta.range.max}`)
        props.push(`range: { ${rangeParts.join(', ')} }`)
      }
      if (meta.attributes && meta.attributes.length) {
        props.push(
          `attributes: [${meta.attributes.map((a) => quoteString(a)).join(', ')}] as const`
        )
      }
      const body = props.map((p) => `    ${p}`).join(',\n')
      const suffix = idx === arr.length - 1 ? '' : ','
      return `  ${formatKey(pid)}: {\n${body}\n  }${suffix}`
    })
    .join('\n')}\n} as const`

  const aliasEntries = Object.entries(Object.fromEntries(parameterMetaEntries))
    .filter(([, value]) => value.alias)
    .map(([pid, value]) => [value.alias as string, pid])

  const aliasLines = aliasEntries.map(([alias, pid], idx, arr) => {
    const suffix = idx === arr.length - 1 ? '' : ','
    return `  ${formatKey(alias)}: ${quoteString(pid)}${suffix}`
  })
  const aliasLiteral = `export const PARAMETER_ALIASES = {\n${aliasLines.join('\n')}\n} as const`

  const fileContent = `${fileHeader}
${deviceIdsLiteral}

export type DeviceId = (typeof DEVICE_IDS)[number]

${parameterIdsLiteral}

export type ParameterId = (typeof PARAMETER_IDS)[number]

export type ParameterMeta = {
  id: ParameterId
  alias?: string
  name?: string
  unit?: string
  menu?: number
  description?: string
  range?: { min?: number; max?: number }
  attributes?: string[]
}

${deviceParamsLiteral}

${parameterMetaLiteral}

${aliasLiteral}

export type ParameterAlias = keyof typeof PARAMETER_ALIASES
`

  fs.writeFileSync(outPath, fileContent)
  console.log(`Tipos generados en: ${outPath}`)
}

main()
