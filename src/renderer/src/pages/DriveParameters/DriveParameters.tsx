import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { ScreenLayout } from 'layouts'
import {
  useAccessMode,
  useIsViewportBelow,
  useMotorControlModePreference,
  usePreferredSingleMotorScope
} from 'hooks'
import { useRealtime } from 'hooks/useRealtime'
import { useOnDemandParameters } from 'hooks/useOnDemandParameters'
import { useSendCommand } from 'hooks/useSendCommand'
import {
  getDriveMenusForDevice,
  getDriveParameters,
  updateDriveParameterScaleFactor
} from 'services/driveService'
import { DriveMenu, DriveParameter } from 'types/drive'
import { ParameterId } from 'types'
import { VirtualKeyboard } from 'components/VirtualKeyboard'
import { getMotorDriveDeviceId, type MotorScope } from 'utils/motorDeviceMapping'
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
  HeaderCenterControls,
  HeaderLeft,
  HeaderMetaText,
  HeaderMotorButton,
  HeaderMotorSelector,
  HeaderRightInfo,
  HeaderRightLayout,
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
  MobileMenuToolbar,
  MobileMenuSummary,
  MobileMenuLabel,
  MobileMenuValue,
  MenuPickerButton,
  MenuPickerOverlay,
  MenuPickerDialog,
  MenuPickerHeader,
  MenuPickerTitleGroup,
  MenuPickerTitle,
  MenuPickerSubtitle,
  MenuPickerClose,
  MenuPickerList,
  MenuPickerItem,
  MenuPickerItemTitle,
  MenuPickerItemBadge,
  Title,
  Unit,
  Value,
  ValueRow,
  SubLabel
} from './DriveParameters.styles'
import { List, RotateCw, Search, ChevronUp, ChevronDown, X } from 'lucide-react'

const PAGE_SIZE = 9
const EXTRA_LIMIT = 3

type DriveParametersNavigationState = {
  motorScope?: MotorScope
} | null

const normalizeMotorScope = (value: unknown): MotorScope | null => {
  if (value === 1 || value === '1') return 1
  if (value === 2 || value === '2') return 2
  return null
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return '-'
  return String(value)
}

const DriveParameters = () => {
  const { isViewOnly } = useAccessMode()
  const isMobileViewport = useIsViewportBelow(768)
  const isMobileViewOnly = isViewOnly && isMobileViewport
  const location = useLocation()
  const navigationState = location.state as DriveParametersNavigationState
  const requestedMotorScope = normalizeMotorScope(navigationState?.motorScope)
  const [menus, setMenus] = useState<DriveMenu[]>([])
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null)
  const [selectedMotor, setSelectedMotor] = useState<MotorScope>(requestedMotorScope ?? 1)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [parameters, setParameters] = useState<DriveParameter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [modalParam, setModalParam] = useState<DriveParameter | null>(null)
  const [saving, setSaving] = useState(false)
  const [isMenuPickerOpen, setIsMenuPickerOpen] = useState(false)
  const [searchKeyboard, setSearchKeyboard] = useState<{ visible: boolean; initialValue: string }>({
    visible: false,
    initialValue: ''
  })

  const menuListRef = useRef<HTMLDivElement>(null)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [motorControlMode] = useMotorControlModePreference()
  const singleMotorScope = usePreferredSingleMotorScope()
  const isDualMotorMode = motorControlMode === 'dual'
  const activeMotorScope: MotorScope = isDualMotorMode ? selectedMotor : singleMotorScope
  const { devicesData, subscribeDevice, unsubscribeDevice } = useRealtime()
  const { writeParameter } = useSendCommand()
  const activeDeviceId = getMotorDriveDeviceId(activeMotorScope)
  const normalizedSearch = search.trim()
  const isSearchingAllMenus = normalizedSearch.length > 0

  const liveSnapshot = devicesData[activeDeviceId] || {}

  useEffect(() => {
    if (!isDualMotorMode || requestedMotorScope === null) return

    setSelectedMotor(requestedMotorScope)
  }, [isDualMotorMode, requestedMotorScope])

  const parseMenuNumber = useCallback((menu: DriveMenu['menu']) => {
    if (typeof menu === 'number') return menu
    const numeric = Number.parseInt(String(menu), 10)
    return Number.isNaN(numeric) ? null : numeric
  }, [])

  useEffect(() => {
    subscribeDevice(activeDeviceId)
    return () => unsubscribeDevice(activeDeviceId)
  }, [activeDeviceId, subscribeDevice, unsubscribeDevice])

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await getDriveMenusForDevice(activeDeviceId)
        const safeMenus = Array.isArray(data) ? data : []
        const populatedMenus = safeMenus.filter((menu) => parseMenuNumber(menu.menu) !== null)

        setMenus(populatedMenus)
        if (!populatedMenus.length) {
          setSelectedMenu(null)
          return
        }

        setSelectedMenu((current) => {
          const selectedStillExists = populatedMenus.some(
            (menu) => parseMenuNumber(menu.menu) === current
          )
          if (current === null || !selectedStillExists) {
            return parseMenuNumber(populatedMenus[0].menu)
          }
          return current
        })
      } catch (err) {
        console.error('Failed to load menus', err)
      }
    }
    void loadMenus()
  }, [activeDeviceId, parseMenuNumber])

  const refreshParameters = useCallback(async (resetOnError = true) => {
    setLoading(true)
    try {
      const resp = await getDriveParameters({
        deviceId: activeDeviceId,
        menu: isSearchingAllMenus ? undefined : selectedMenu ?? undefined,
        search: normalizedSearch,
        page,
        pageSize: PAGE_SIZE
      })
      const safeItems = Array.isArray(resp.items) ? resp.items : []
      const safeTotal = Number.isFinite(resp.total) ? resp.total : safeItems.length

      setParameters(safeItems)
      setTotal(safeTotal)
      setModalParam((current) => {
        if (!current) return current
        return safeItems.find((item) => item.id === current.id) ?? current
      })
      return {
        ...resp,
        items: safeItems,
        total: safeTotal
      }
    } catch (err) {
      console.error('Failed to load parameters', err)
      if (resetOnError) {
        setParameters([])
        setTotal(0)
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [activeDeviceId, isSearchingAllMenus, normalizedSearch, page, selectedMenu])

  useEffect(() => {
    void refreshParameters().catch(() => undefined)
  }, [refreshParameters])

  const visibleIds = useMemo(() => parameters.map((p) => p.id), [parameters])

  useOnDemandParameters({
    deviceId: activeDeviceId,
    parameterIds: visibleIds,
    limit: PAGE_SIZE + EXTRA_LIMIT
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const selectedMotorLabel = `Motor #${activeMotorScope}`
  const selectedMenuLabel =
    menus.find((menu) => parseMenuNumber(menu.menu) === selectedMenu)?.name ?? 'User Configured Menu'
  const parameterScopeLabel = isSearchingAllMenus ? 'All menus' : selectedMenu ?? 'All'

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
      const success = await writeParameter({
        deviceId: activeDeviceId,
        parameterId: modalParam.id as ParameterId,
        value: value
      })
      if (!success) {
        throw new Error('Failed to write parameter')
      }
      closeModal()
    } catch (err) {
      console.error('Failed to write parameter', err)
      throw err instanceof Error ? err : new Error('Failed to write parameter')
    } finally {
      setSaving(false)
    }
  }

  const handleScaleFactorChange = async (scaleFactor: number) => {
    if (!modalParam) return

    await updateDriveParameterScaleFactor({
      deviceId: activeDeviceId,
      parameterId: modalParam.id,
      scaleFactor
    })

    setParameters((current) =>
      current.map((param) => (param.id === modalParam.id ? { ...param, scale_factor: scaleFactor } : param))
    )
    setModalParam((current) =>
      current ? { ...current, scale_factor: scaleFactor } : current
    )

    try {
      await refreshParameters(false)
    } catch (err) {
      console.error('Failed to refresh parameters after scale factor update', err)
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

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }
  }, [])

  const pageStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const pagedInfo = `${pageStart}-${Math.min(page * PAGE_SIZE, total)} of ${total}`
  const headerMeta = (
    <>
      {isDualMotorMode ? <HeaderMetaText>{selectedMotorLabel}</HeaderMetaText> : null}
      <Meta>
        <span>Menu: {parameterScopeLabel}</span>
        <span>Params: {pagedInfo}</span>
        {loading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RotateCw size={18} /> Loading
          </span>
        )}
      </Meta>
    </>
  )

  return (
    <ScreenLayout>
      <PageWrapper>
        {!isMobileViewOnly ? (
          <Sidebar>
            <SearchRow>
              <SearchInput
                value={search}
                onPointerDown={(e) => {
                  if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                    e.preventDefault()
                    setSearchKeyboard({ visible: true, initialValue: search })
                  }
                }}
                onClick={() => setSearchKeyboard({ visible: true, initialValue: search })}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search all menus"
              />
              <Search color="#94a3b8" />
            </SearchRow>

            <MenuListWrapper>
              <MenuList ref={menuListRef}>
                {menus.map((m) => {
                  const menuNum = parseMenuNumber(m.menu)
                  const active = menuNum === selectedMenu
                  return (
                    <MenuItem
                      key={`${m.menu}`}
                      $active={active}
                      onClick={() => {
                        setSelectedMenu(parseMenuNumber(m.menu))
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
        ) : null}

        <ContentArea>
          {isMobileViewOnly ? (
            <MobileMenuToolbar>
              <MobileMenuSummary>
                <MobileMenuLabel>Selected Menu</MobileMenuLabel>
                <MobileMenuValue>{selectedMenuLabel}</MobileMenuValue>
              </MobileMenuSummary>

              <MenuPickerButton type="button" onClick={() => setIsMenuPickerOpen(true)}>
                <List size={18} />
                Select Menu
              </MenuPickerButton>
            </MobileMenuToolbar>
          ) : null}

          <HeaderRow>
            <HeaderLeft>
              <List />
              <Title>Drive Parameters</Title>
            </HeaderLeft>

            {isDualMotorMode ? (
              <HeaderRightLayout>
                <HeaderCenterControls>
                  <HeaderMotorSelector>
                    <HeaderMotorButton
                      type="button"
                      $active={selectedMotor === 2}
                      onClick={() => setSelectedMotor(2)}
                    >
                      Motor #2
                    </HeaderMotorButton>
                    <HeaderMotorButton
                      type="button"
                      $active={selectedMotor === 1}
                      onClick={() => setSelectedMotor(1)}
                    >
                      Motor #1
                    </HeaderMotorButton>
                  </HeaderMotorSelector>
                </HeaderCenterControls>

                <HeaderRightInfo>{headerMeta}</HeaderRightInfo>
              </HeaderRightLayout>
            ) : (
              headerMeta
            )}
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
                      {isSearchingAllMenus && param.menu !== undefined ? (
                        <Badge>Menu {param.menu}</Badge>
                      ) : null}
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
                      <Unit>{param.unit || '--'}</Unit>
                    </div>
                  </ValueRow>

                  <FooterRow>
                    <SubLabel>Default: {formatValue(param.default)}</SubLabel>
                    <SubLabel>{rangeText ? `Range: ${rangeText}` : 'Range: --'}</SubLabel>
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
          onScaleFactorChange={handleScaleFactorChange}
          isSaving={saving}
          forceReadOnly={isViewOnly}
        />

        <VirtualKeyboard
          visible={searchKeyboard.visible}
          mode="alpha"
          label="Search"
          initialValue={searchKeyboard.initialValue}
          onConfirm={(val) => {
            setSearch(val)
            setPage(1)
            setSearchKeyboard({ visible: false, initialValue: '' })
          }}
          onCancel={() => setSearchKeyboard({ visible: false, initialValue: '' })}
        />

        {isMobileViewOnly && isMenuPickerOpen ? (
          <>
            <MenuPickerOverlay
              type="button"
              aria-label="Close menu picker"
              onClick={() => setIsMenuPickerOpen(false)}
            />

            <MenuPickerDialog>
              <MenuPickerHeader>
                <MenuPickerTitleGroup>
                  <MenuPickerTitle>Select Menu</MenuPickerTitle>
                  <MenuPickerSubtitle>
                    Pick the parameter menu you want to inspect on this phone screen.
                  </MenuPickerSubtitle>
                </MenuPickerTitleGroup>

                <MenuPickerClose
                  type="button"
                  aria-label="Close menu picker"
                  onClick={() => setIsMenuPickerOpen(false)}
                >
                  <X size={18} />
                </MenuPickerClose>
              </MenuPickerHeader>

              <MenuPickerList>
                {menus.map((menu) => {
                  const menuNum = parseMenuNumber(menu.menu)
                  const active = menuNum === selectedMenu

                  return (
                    <MenuPickerItem
                      key={`mobile-menu-${menu.menu}`}
                      type="button"
                      $active={active}
                      onClick={() => {
                        setSelectedMenu(menuNum)
                        setPage(1)
                        setIsMenuPickerOpen(false)
                      }}
                    >
                      <MenuPickerItemTitle>{menu.name}</MenuPickerItemTitle>
                      <MenuPickerItemBadge>Menu {menu.menu}</MenuPickerItemBadge>
                    </MenuPickerItem>
                  )
                })}
              </MenuPickerList>
            </MenuPickerDialog>
          </>
        ) : null}
      </PageWrapper>
    </ScreenLayout>
  )
}

export default DriveParameters
