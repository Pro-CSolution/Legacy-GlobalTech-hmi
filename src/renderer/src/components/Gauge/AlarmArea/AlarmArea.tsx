import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Area } from './AlarmArea.styles'

interface AlarmAreaProps {
  color: string
  start: number
  end: number
  visible: boolean
  minValue: number
  maxValue: number
}

const percentToDegrees = (percent: number): number => {
  return (percent / 100) * 240 - 210
}

const lengthPercent = (startDegrees: number, endDegrees: number): number => {
  const difference = endDegrees - startDegrees
  return difference * 2.01 + 300
}

const AlarmArea = ({ color, start, end, visible, minValue, maxValue }: AlarmAreaProps) => {
  const [startDegrees, setStartDegrees] = useState<number | undefined>()
  const [widthArea, setWidthArea] = useState<number | undefined>()

  const limitValue = (value: number): number => {
    if (value < 0) {
      return 0
    } else if (value > 100) {
      return 100
    } else {
      return value
    }
  }

  useEffect(() => {
    const limitedStart = limitValue(start)
    const limitedEnd = limitValue(end)
    setStartDegrees(percentToDegrees(limitedStart))
    setWidthArea(lengthPercent(limitedStart, limitedEnd))
  }, [minValue, maxValue, start, end])

  return (
    <Area
      style={
        {
          '--alarm-area-start-deg': `${startDegrees ?? 0}deg`
        } as CSSProperties
      }
      display={!visible ? 'none' : 'initial'}
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
    >
      <circle r="48%" cx="50%" cy="50%" strokeDasharray={`${widthArea}%`} stroke={color} />
    </Area>
  )
}

export default AlarmArea
