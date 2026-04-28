import { Bell, ChartLine, Fan, LayoutDashboard, List, Thermometer } from 'lucide-react'

export const monitorNavigationItems = [
  {
    id: 'main',
    label: 'Main',
    subLabel: 'Overview',
    icon: LayoutDashboard,
    route: '/'
  },
  {
    id: 'temps',
    label: 'Temps',
    subLabel: 'Thermal',
    icon: Thermometer,
    route: '/temperatures'
  },
  {
    id: 'cooling',
    label: 'Cooling',
    subLabel: 'Pumps',
    icon: Fan,
    route: '/cooling-system'
  },
  {
    id: 'params',
    label: 'Params',
    subLabel: 'View',
    icon: List,
    route: '/drive-parameters'
  },
  {
    id: 'trends',
    label: 'Trend',
    subLabel: 'History',
    icon: ChartLine,
    route: '/trends'
  },
  {
    id: 'alarms',
    label: 'Alarms',
    subLabel: 'Trips',
    icon: Bell,
    route: '/alarms'
  }
] as const

export type MonitorNavigationItem = (typeof monitorNavigationItems)[number]
