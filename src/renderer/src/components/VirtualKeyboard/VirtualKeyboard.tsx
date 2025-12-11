import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronUp, Delete, X, ArrowLeft } from 'lucide-react'
import {
  Overlay,
  Header,
  Label,
  Preview,
  Body,
  Row,
  KeyButton,
  KeyWide,
  HeaderActions,
  AlphaRow
} from './VirtualKeyboard.styles'

type KeyboardMode = 'numeric' | 'alpha'

export interface VirtualKeyboardProps {
  visible: boolean
  mode: KeyboardMode
  label?: string
  initialValue?: string | number
  onConfirm: (value: string) => void
  onCancel: () => void
}

type KeyDef = {
  key: string
  action?: 'backspace' | 'clear' | 'cancel' | 'confirm' | 'shift' | 'space'
  icon?: JSX.Element
  variant?: 'confirm' | 'cancel' | 'special'
}

const NUMERIC_LAYOUT: KeyDef[] = [
  { key: '7' },
  { key: '8' },
  { key: '9' },
  { key: 'BS', action: 'backspace', icon: <Delete size={20} />, variant: 'special' },
  { key: '4' },
  { key: '5' },
  { key: '6' },
  { key: 'CLR', action: 'clear', variant: 'special' },
  { key: '1' },
  { key: '2' },
  { key: '3' },
  { key: 'ESC', action: 'cancel', icon: <X size={18} />, variant: 'cancel' },
  { key: '-' },
  { key: '0' },
  { key: '.' },
  { key: 'ENT', action: 'confirm', icon: <Check size={18} />, variant: 'confirm' }
]

const QWERTY_LAYOUT_ROW1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const QWERTY_LAYOUT_ROW2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
const QWERTY_LAYOUT_ROW3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm']

const INDUSTRIAL_ROW = [
  { key: '1', shift: '°' },
  { key: '2', shift: '°C' },
  { key: '3', shift: '°F' },
  { key: '4', shift: 'Ω' },
  { key: '5', shift: 'µ' },
  { key: '6', shift: 'Ø' },
  { key: '7', shift: '±' },
  { key: '8', shift: 'Δ' },
  { key: '9', shift: 'π' },
  { key: '0', shift: '%' }
]

export const VirtualKeyboard = ({
  visible,
  mode,
  label,
  initialValue = '',
  onConfirm,
  onCancel
}: VirtualKeyboardProps) => {
  const [currentValue, setCurrentValue] = useState<string>('')
  const [isShift, setIsShift] = useState(false)

  useEffect(() => {
    if (visible) {
      setCurrentValue(String(initialValue ?? ''))
      setIsShift(false)
    }
  }, [visible, initialValue])

  const handlePress = (char: string) => {
    setCurrentValue((prev) => prev + char)
  }

  const handleAction = (action: KeyDef['action']) => {
    switch (action) {
      case 'backspace':
        setCurrentValue((prev) => prev.slice(0, -1))
        break
      case 'clear':
        setCurrentValue('')
        break
      case 'shift':
        setIsShift((s) => !s)
        break
      case 'space':
        setCurrentValue((prev) => prev + ' ')
        break
      case 'confirm':
        onConfirm(currentValue)
        break
      case 'cancel':
        onCancel()
        break
      default:
        break
    }
  }

  const numericKeys = useMemo(() => NUMERIC_LAYOUT, [])

  const renderNumeric = () => (
    <Body $mode="numeric">
      {numericKeys.map((k, idx) => (
        <KeyButton
          key={`${k.key}-${idx}`}
          $variant={k.variant}
          onClick={() => (k.action ? handleAction(k.action) : handlePress(k.key))}
        >
          {k.icon || k.key}
        </KeyButton>
      ))}
    </Body>
  )

  const renderAlphaRow = (chars: string[], padding?: string) => (
    <AlphaRow style={padding ? { padding } : undefined}>
      {chars.map((char) => {
        const display = isShift ? char.toUpperCase() : char
        return (
          <KeyButton key={char} onClick={() => handlePress(display)}>
            {display}
          </KeyButton>
        )
      })}
    </AlphaRow>
  )

  const renderIndustrialRow = () => (
    <AlphaRow>
      {INDUSTRIAL_ROW.map((item) => {
        const display = isShift ? item.shift : item.key
        return (
          <KeyButton key={item.key} onClick={() => handlePress(display)}>
            {display}
          </KeyButton>
        )
      })}
    </AlphaRow>
  )

  const renderAlpha = () => (
    <Body $mode="alpha">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
        {renderIndustrialRow()}
        {renderAlphaRow(QWERTY_LAYOUT_ROW1)}
        {renderAlphaRow(QWERTY_LAYOUT_ROW2, '0 18px')}
        <Row>
          <KeyWide $variant="special" $active={isShift} onClick={() => handleAction('shift')}>
            <ChevronUp size={18} />
          </KeyWide>
          {QWERTY_LAYOUT_ROW3.map((char) => {
            const display = isShift ? char.toUpperCase() : char
            return (
              <KeyButton key={char} onClick={() => handlePress(display)}>
                {display}
              </KeyButton>
            )
          })}
          <KeyWide $variant="special" onClick={() => handleAction('backspace')}>
            <ArrowLeft size={18} />
          </KeyWide>
        </Row>
        <Row>
          <KeyWide $variant="cancel" onClick={() => handleAction('cancel')}>
            <X size={18} />
          </KeyWide>
          <KeyButton onClick={() => handlePress('.')}>.</KeyButton>
          <KeyButton onClick={() => handlePress('-')}>-</KeyButton>
          <KeyWide onClick={() => handleAction('space')}>SPACE</KeyWide>
          <KeyButton onClick={() => handlePress('_')}>_</KeyButton>
          <KeyButton onClick={() => handlePress('@')}>@</KeyButton>
          <KeyWide $variant="confirm" onClick={() => handleAction('confirm')}>
            <Check size={18} />
          </KeyWide>
        </Row>
      </div>
    </Body>
  )

  const content = (
    <Overlay $visible={visible}>
      <Header>
        <div className="header-content">
          <Label>{label || (mode === 'numeric' ? 'Numeric input' : 'Text input')}</Label>
          <Preview>{currentValue}</Preview>
          <HeaderActions>
            <KeyButton $variant="cancel" onClick={() => handleAction('cancel')}>
              <X size={16} />
            </KeyButton>
            <KeyButton $variant="confirm" onClick={() => handleAction('confirm')}>
              <Check size={16} />
            </KeyButton>
          </HeaderActions>
        </div>
      </Header>
      {mode === 'numeric' ? renderNumeric() : renderAlpha()}
    </Overlay>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}

export default VirtualKeyboard
