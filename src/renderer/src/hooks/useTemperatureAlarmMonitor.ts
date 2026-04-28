import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ParameterId } from 'types'
import {
  getMotorDriveDeviceId,
  getMotorWagoLiveDeviceId,
  type MotorScope
} from 'utils/motorDeviceMapping'
import {
  getMotorTemperatureAlertLabel,
  getMotorTemperatureAlertSeverity,
  getMotorTemperatureAlertSource,
  getMotorTemperatureAlertSourceUnit,
  isDisconnectedMotorWindingTemperature,
  MOTOR_TEMPERATURE_ALARM_PARAMETER_IDS,
  type TemperatureAlertSeverity
} from 'utils/temperatureAlerts'
import { fetchWagoLiveSnapshot } from 'services'
import {
  MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS,
  getResolvedMainScreenTemperatureRegister,
  toHoldingRegisterOffset
} from 'utils/mainTemperatureMapping'
import { useDeviceData } from './useDeviceData'
import { useTopBannerNotice } from './useTopBannerNotice'

const NOTICE_DURATION_MS = 4500
const NOTICE_GAP_MS = 200
const MOTOR_SCOPES: readonly MotorScope[] = [1, 2]

type PendingNotice = {
  key: string
  message: string
}

type WagoLiveSnapshotState = Record<
  MotorScope,
  {
    raw: Partial<Record<ParameterId, number | null>>
    connected: boolean
  }
>

const toNumber = (value: unknown): number | null => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export const useTemperatureAlarmMonitor = (): void => {
  const { showNotice } = useTopBannerNotice()
  const { raw: motorOneDriveRaw } = useDeviceData(getMotorDriveDeviceId(1))
  const { raw: motorTwoDriveRaw } = useDeviceData(getMotorDriveDeviceId(2))
  const [motorWagoLiveByScope, setMotorWagoLiveByScope] = useState<WagoLiveSnapshotState>({
    1: { raw: {}, connected: false },
    2: { raw: {}, connected: false }
  })

  const previousSeverityByChannelRef = useRef<Record<string, TemperatureAlertSeverity>>({})
  const pendingNoticesRef = useRef<PendingNotice[]>([])
  const pendingNoticeKeysRef = useRef<Set<string>>(new Set())
  const queueTimerRef = useRef<number | null>(null)

  useEffect(() => {
    let mounted = true

    const loadWagoLiveSnapshots = async () => {
      const results = await Promise.allSettled(
        MOTOR_SCOPES.map(async (scope) => {
          const addresses = MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS.map((parameterId) => {
            const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
            return typeof modbusRegister === 'number' ? toHoldingRegisterOffset(modbusRegister) : null
          }).filter((address): address is number => typeof address === 'number')

          const snapshot = await fetchWagoLiveSnapshot({
            deviceId: getMotorWagoLiveDeviceId(scope),
            registerType: 'holding',
            addresses
          })

          const nextRaw: Partial<Record<ParameterId, number | null>> = {}
          MAIN_SCREEN_TEMPERATURE_PARAMETER_IDS.forEach((parameterId) => {
            const modbusRegister = getResolvedMainScreenTemperatureRegister(parameterId, scope)
            if (typeof modbusRegister !== 'number') return
            nextRaw[parameterId] =
              snapshot.values.find((entry) => entry.modbus_register === modbusRegister)?.value ?? null
          })

          return { scope, nextRaw, connected: snapshot.connected }
        })
      )

      if (!mounted) return

      setMotorWagoLiveByScope((prev) => {
        const next: WagoLiveSnapshotState = {
          1: { ...prev[1] },
          2: { ...prev[2] }
        }

        results.forEach((result) => {
          if (result.status !== 'fulfilled') return
          next[result.value.scope] = {
            raw: result.value.nextRaw,
            connected: result.value.connected
          }
        })

        return next
      })
    }

    void loadWagoLiveSnapshots()
    const intervalId = window.setInterval(() => {
      void loadWagoLiveSnapshots()
    }, 1000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const motorSnapshots = useMemo(
    () => ({
      1: {
        driveRaw: motorOneDriveRaw,
        wagoRaw: motorWagoLiveByScope[1].raw,
        driveConnected: Boolean(motorOneDriveRaw['__connected']),
        wagoConnected: motorWagoLiveByScope[1].connected
      },
      2: {
        driveRaw: motorTwoDriveRaw,
        wagoRaw: motorWagoLiveByScope[2].raw,
        driveConnected: Boolean(motorTwoDriveRaw['__connected']),
        wagoConnected: motorWagoLiveByScope[2].connected
      }
    }),
    [motorOneDriveRaw, motorTwoDriveRaw, motorWagoLiveByScope]
  )

  const processQueue = useCallback(() => {
    if (queueTimerRef.current !== null) {
      return
    }

    const nextNotice = pendingNoticesRef.current.shift()
    if (!nextNotice) {
      return
    }

    pendingNoticeKeysRef.current.delete(nextNotice.key)
    showNotice({ tone: 'error', message: nextNotice.message }, NOTICE_DURATION_MS)

    queueTimerRef.current = window.setTimeout(() => {
      queueTimerRef.current = null
      processQueue()
    }, NOTICE_DURATION_MS + NOTICE_GAP_MS)
  }, [showNotice])

  const enqueueNotice = useCallback(
    (key: string, message: string) => {
      if (!message.trim() || pendingNoticeKeysRef.current.has(key)) {
        return
      }

      pendingNoticesRef.current.push({ key, message })
      pendingNoticeKeysRef.current.add(key)
      processQueue()
    },
    [processQueue]
  )

  useEffect(() => {
    return () => {
      if (queueTimerRef.current !== null) {
        window.clearTimeout(queueTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const nextSeverityByChannel: Record<string, TemperatureAlertSeverity> = {}

    MOTOR_SCOPES.forEach((scope) => {
      const snapshot = motorSnapshots[scope]

      MOTOR_TEMPERATURE_ALARM_PARAMETER_IDS.forEach((parameterId) => {
        const channelKey = `${scope}:${parameterId}`
        const source = getMotorTemperatureAlertSource(parameterId)
        const sourceUnit = getMotorTemperatureAlertSourceUnit(parameterId)

        if (!source || !sourceUnit) {
          nextSeverityByChannel[channelKey] = 'normal'
          return
        }

        const sourceConnected =
          source === 'drive' ? snapshot.driveConnected : snapshot.wagoConnected
        if (!sourceConnected) {
          nextSeverityByChannel[channelKey] = 'normal'
          return
        }

        const sourceRaw = source === 'drive' ? snapshot.driveRaw : snapshot.wagoRaw
        const rawValue = toNumber(sourceRaw[parameterId])
        if (
          isDisconnectedMotorWindingTemperature(parameterId as ParameterId, rawValue, sourceUnit)
        ) {
          nextSeverityByChannel[channelKey] = 'normal'
          return
        }

        const severity = getMotorTemperatureAlertSeverity(
          parameterId as ParameterId,
          rawValue,
          sourceUnit
        )
        const previousSeverity = previousSeverityByChannelRef.current[channelKey] ?? 'normal'

        if (
          severity !== 'normal' &&
          (previousSeverity === 'normal' ||
            (previousSeverity === 'warning' && severity === 'critical'))
        ) {
          enqueueNotice(
            `${channelKey}:${severity}`,
            `${getMotorTemperatureAlertLabel(parameterId)} temperature alarm for motor ${scope}`
          )
        }

        nextSeverityByChannel[channelKey] = severity
      })
    })

    previousSeverityByChannelRef.current = nextSeverityByChannel
  }, [enqueueNotice, motorSnapshots])
}
