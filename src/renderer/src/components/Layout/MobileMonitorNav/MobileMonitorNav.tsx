import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { monitorNavigationItems } from 'monitor/navigation'
import {
  CloseButton,
  CurrentRoute,
  Drawer,
  DrawerEyebrow,
  DrawerHeader,
  DrawerTitle,
  DrawerTitleStack,
  FloatingButton,
  Overlay,
  RouteButton,
  RouteIconWrap,
  RouteLabel,
  RouteList,
  RouteSubLabel,
  RouteText
} from './MobileMonitorNav.styles'

const MobileMonitorNav = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const currentItem =
    monitorNavigationItems.find((item) => item.route === currentPath) ?? monitorNavigationItems[0]

  useEffect(() => {
    setIsOpen(false)
  }, [currentPath])

  return (
    <>
      <Overlay type="button" aria-label="Close navigation" $open={isOpen} onClick={() => setIsOpen(false)} />

      <Drawer $open={isOpen}>
        <DrawerHeader>
          <DrawerTitleStack>
            <DrawerEyebrow>Monitor Navigation</DrawerEyebrow>
            <DrawerTitle>Screens</DrawerTitle>
            <CurrentRoute>{currentItem.label}</CurrentRoute>
          </DrawerTitleStack>

          <CloseButton type="button" aria-label="Close navigation" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </CloseButton>
        </DrawerHeader>

        <RouteList>
          {monitorNavigationItems.map((item) => {
            const Icon = item.icon
            const isActive = item.route === currentPath

            return (
              <RouteButton
                key={item.id}
                type="button"
                $active={isActive}
                onClick={() => navigate(item.route, { flushSync: true })}
              >
                <RouteIconWrap>
                  <Icon size={22} />
                </RouteIconWrap>
                <RouteText>
                  <RouteLabel>{item.label}</RouteLabel>
                  <RouteSubLabel>{item.subLabel}</RouteSubLabel>
                </RouteText>
              </RouteButton>
            )
          })}
        </RouteList>
      </Drawer>

      <FloatingButton
        type="button"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        $open={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Menu size={24} />
      </FloatingButton>
    </>
  )
}

export default MobileMonitorNav
