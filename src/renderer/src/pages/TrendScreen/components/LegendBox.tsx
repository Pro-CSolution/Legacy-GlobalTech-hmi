import { FC } from 'react'
import { useTheme } from 'styled-components'
import * as S from '../TrendScreen.styles'
import { CurrentValueItem } from '../types'

type Props = {
  values: CurrentValueItem[]
}

export const LegendBox: FC<Props> = ({ values }) => {
  const theme = useTheme()

  return (
    <S.LegendBox>
      <S.CategoryTitle>Current Values</S.CategoryTitle>
      {values.map((val, idx) => (
        <S.LegendItem key={idx}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <S.ColorDot color={val.color!} />
            <span style={{ color: theme.colors.text.secondary }}>{val.label}</span>
            {val.isManual && (
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 4px',
                  border: `1px solid ${theme.colors.borders.primary}`,
                  borderRadius: '2px',
                  color: theme.colors.text.secondary
                }}
              >
                Manual
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'monospace', fontWeight: 'bold', marginLeft: '10px' }}>
            {val.value.toFixed(1)}{' '}
            <span style={{ fontSize: '10px', color: theme.colors.text.secondary }}>
              {' '}
              {val.unit}
            </span>
          </div>
        </S.LegendItem>
      ))}
    </S.LegendBox>
  )
}
