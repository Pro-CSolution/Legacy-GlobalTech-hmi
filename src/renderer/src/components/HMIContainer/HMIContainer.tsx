import React from 'react'
import { Centerer, Canvas } from './HMIContainer.styles'
import { useAspectScale } from 'hooks/useScale'
import { HMI_CONFIG } from 'config/constants'

export interface HMIContainerProps {
  children: React.ReactNode
  baseWidth?: number
  baseHeight?: number
}

const HMIContainer: React.FC<HMIContainerProps> = ({
  children,
  baseWidth = HMI_CONFIG.SCREEN.BASE_WIDTH,
  baseHeight = HMI_CONFIG.SCREEN.BASE_HEIGHT
}) => {
  const { containerRef, scale } = useAspectScale(baseWidth, baseHeight)

  return (
    <Centerer ref={containerRef}>
      <Canvas width={baseWidth} height={baseHeight} scale={scale}>
        {children}
      </Canvas>
    </Centerer>
  )
}

export default HMIContainer
