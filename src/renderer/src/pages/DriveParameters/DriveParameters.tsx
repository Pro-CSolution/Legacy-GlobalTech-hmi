import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ScreenLayout } from 'layouts'
import { useRealtime } from 'hooks/useRealtime'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { useSendCommand } from 'hooks/useSendCommand'
import { getDriveMenus, getDriveParameters } from 'services/driveService'
import { DriveMenu, DriveParameter } from 'types/drive'
import { DeviceId, ParameterId } from 'types'
import { ParameterDetailModal } from './components/ParameterDetailModal/ParameterDetailModal'
import {
  Badge,
  BadgeRow,
  Card,
  CardHeader,
  CardName,
  CardId,
  CardsArea,
  ContentArea,
  FooterRow,
  HeaderRow,
  MenuItem,
  MenuList,
  MenuListWrapper,
  MenuName,
  MenuBadge,
  Meta,
  PageButton,
  PageControls,
  PageWrapper,
  PaginationBar,
  ScrollButton,
  ScrollControls,
  SearchInput,
  SearchRow,
  Sidebar,
  Title,
  Unit,
  Value,
  ValueRow,
  SubLabel
} from './DriveParameters.styles'
import { List, RotateCw, Search, ChevronUp, ChevronDown } from 'lucide-react'

const PAGE_SIZE = 9
const EXTRA_LIMIT = 3
const DEVICE_ID = 'drive_avid' as DeviceId

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return '-'
  return String(value)
}

const DriveParameters: React.FC = () => {
  const [menus, setMenus] = useState<DriveMenu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<number | null>(1)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [parameters, setParameters] = useState<DriveParameter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [modalParam, setModalParam] = useState<DriveParameter | null>(null)
  const [saving, setSaving] = useState(false)

  const menuListRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { devicesData, subscribeDevice, unsubscribeDevice } = useRealtime()
  const { writeParameter } = useSendCommand()

  const liveSnapshot = devicesData[DEVICE_ID] || {}

  useEffect(() => {
    subscribeDevice(DEVICE_ID)
    return () => unsubscribeDevice(DEVICE_ID)
  }, [subscribeDevice, unsubscribeDevice])

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await getDriveMenus()
        setMenus(data)
        if (data.length && selectedMenu === null) {
          const firstNumeric = data.find((m) => typeof m.menu === 'number')
          setSelectedMenu(
            typeof firstNumeric?.menu === 'number' ? firstNumeric.menu : (data[0].menu as number)
          )
        }
      } catch (err) {
        console.error('Failed to load menus', err)
      }
    }
    void loadMenus()
  }, [selectedMenu])

  useEffect(() => {
    const loadParameters = async () => {
      setLoading(true)
      try {
        const resp = await getDriveParameters({
          deviceId: DEVICE_ID,
          menu: selectedMenu ?? undefined,
          search,
          page,
          pageSize: PAGE_SIZE
        })
        setParameters(resp.items)
        setTotal(resp.total)
      } catch (err) {
        console.error('Failed to load parameters', err)
        setParameters([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }
    void loadParameters()
  }, [selectedMenu, search, page])

  const visibleIds = useMemo(() => parameters.map((p) => p.id), [parameters])

  useOnDemandParameters({
    deviceId: DEVICE_ID,
    parameterIds: visibleIds,
    limit: PAGE_SIZE + EXTRA_LIMIT
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const openModal = (param: DriveParameter) => {
    setModalParam(param)
  }

  const closeModal = () => {
    setModalParam(null)
  }

  const isReadOnly = (param?: DriveParameter | null) =>
    !!param?.attributes?.some((attr) => attr === 'R')

  const handleSave = async (value: number) => {
    if (!modalParam) return

    try {
      setSaving(true)
      await writeParameter({
        deviceId: DEVICE_ID,
        parameterId: modalParam.id as ParameterId,
        value: value
      })
      closeModal()
    } catch (err) {
      console.error('Failed to write parameter', err)
    } finally {
      setSaving(false)
    }
  }

  const startScroll = (direction: 'up' | 'down') => {
    if (scrollIntervalRef.current) return

    const step = direction === 'up' ? -28 : 28
    const scroll = () => {
      if (menuListRef.current) {
        menuListRef.current.scrollBy({ top: step, behavior: 'auto' })
      }
    }

    scroll() // Immediate first scroll
    scrollIntervalRef.current = setInterval(scroll, 30)
  }

  const stopScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  const pagedInfo = `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`

  return (
    <ScreenLayout>
      <PageWrapper>
        <Sidebar>
          <SearchRow>
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search ID or Name"
            />
            <Search color="#94a3b8" />
          </SearchRow>

          <MenuListWrapper>
            <MenuList ref={menuListRef}>
              {menus.map((m) => {
                const menuNum = typeof m.menu === 'number' ? m.menu : m.menu
                const active = menuNum === selectedMenu
                return (
                  <MenuItem
                    key={`${m.menu}`}
                    $active={active}
                    onClick={() => {
                      const numeric =
                        typeof m.menu === 'number' ? m.menu : Number.parseInt(String(m.menu), 10)
                      setSelectedMenu(Number.isNaN(numeric) ? null : numeric)
                      setPage(1)
                    }}
                  >
                    <MenuName>{m.name}</MenuName>
                    <MenuBadge>Menu {m.menu}</MenuBadge>
                  </MenuItem>
                )
              })}
            </MenuList>
          </MenuListWrapper>

          <ScrollControls>
            <ScrollButton
              onMouseDown={() => startScroll('up')}
              onMouseUp={stopScroll}
              onMouseLeave={stopScroll}
              onTouchStart={() => startScroll('up')}
              onTouchEnd={stopScroll}
            >
              <ChevronUp size={24} />
            </ScrollButton>
            <ScrollButton
              onMouseDown={() => startScroll('down')}
              onMouseUp={stopScroll}
              onMouseLeave={stopScroll}
              onTouchStart={() => startScroll('down')}
              onTouchEnd={stopScroll}
            >
              <ChevronDown size={24} />
            </ScrollButton>
          </ScrollControls>
        </Sidebar>

        <ContentArea>
          <HeaderRow>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <List />
              <Title>Drive Parameters</Title>
            </div>
            <Meta>
              <span>Menu: {selectedMenu ?? 'All'}</span>
              <span>Params: {pagedInfo}</span>
              {loading && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={18} /> Loading
                </span>
              )}
            </Meta>
          </HeaderRow>

          <CardsArea>
            {parameters.map((param) => {
              const live = liveSnapshot[param.id]
              const currentValue = live !== undefined ? live : param.default
              const readonly = isReadOnly(param)
              const rangeText = param.range_numeric
                ? `${param.range_numeric.min} - ${param.range_numeric.max}`
                : param.range_text || ''
              return (
                <Card key={param.id} onClick={() => openModal(param)} $readonly={readonly}>
                  <CardHeader>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <CardName>
                        {param.name || 'Unnamed'}
                        <CardId>({param.id})</CardId>
                      </CardName>
                      <SubLabel title={param.description}>
                        {param.description || 'No description'}
                      </SubLabel>
                    </div>
                    <BadgeRow>
                      {readonly ? <Badge $tone="warning">R</Badge> : <Badge>RW</Badge>}
                    </BadgeRow>
                  </CardHeader>

                  <ValueRow>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <SubLabel>Live</SubLabel>
                      <Value>{formatValue(currentValue)}</Value>
                    </div>
                    <div
                      style={{
                        textAlign: 'right',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <SubLabel>Unit</SubLabel>
                      <Unit>{param.unit || '—'}</Unit>
                    </div>
                  </ValueRow>

                  <FooterRow>
                    <SubLabel>Default: {formatValue(param.default)}</SubLabel>
                    <SubLabel>{rangeText ? `Range: ${rangeText}` : 'Range: —'}</SubLabel>
                  </FooterRow>
                </Card>
              )
            })}
          </CardsArea>

          <PaginationBar>
            <div>Showing {pagedInfo}</div>
            <PageControls>
              <PageButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </PageButton>
              <PageButton
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </PageButton>
            </PageControls>
          </PaginationBar>
        </ContentArea>

        <ParameterDetailModal
          isOpen={!!modalParam}
          parameter={modalParam}
          liveValue={modalParam ? liveSnapshot[modalParam.id] : undefined}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={saving}
        />
      </PageWrapper>
    </ScreenLayout>
  )
}

export default DriveParameters
