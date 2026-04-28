import styled, { css, RuleSet } from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'
import { Theme } from 'styles/theme'

export const getButtonStyles = (color: string, active: boolean, theme: Theme): RuleSet<object> => {
  const colors = {
    green: {
      bg: 'linear-gradient(180deg, #3da676 0%, #2f8a63 100%)',
      activeBg: 'linear-gradient(180deg, #47b684 0%, #318c66 100%)',
      hover: 'linear-gradient(180deg, #45b182 0%, #338e68 100%)',
      shadow: 'rgba(15, 49, 36, 0.46)',
      border: 'rgba(151, 242, 168, 0.24)',
      glow: 'rgba(75, 210, 123, 0.22)'
    },
    red: {
      bg: 'linear-gradient(180deg, #b95a5a 0%, #994848 100%)',
      activeBg: 'linear-gradient(180deg, #c76666 0%, #a14c4c 100%)',
      hover: 'linear-gradient(180deg, #c76565 0%, #a24b4b 100%)',
      shadow: 'rgba(67, 23, 23, 0.46)',
      border: 'rgba(255, 106, 106, 0.24)',
      glow: 'rgba(255, 106, 106, 0.2)'
    },
    yellow: {
      bg: 'linear-gradient(180deg, #c99a39 0%, #a97c24 100%)',
      activeBg: 'linear-gradient(180deg, #d4a74a 0%, #b4842a 100%)',
      hover: 'linear-gradient(180deg, #d2a345 0%, #b0822a 100%)',
      shadow: 'rgba(74, 51, 11, 0.42)',
      border: 'rgba(255, 214, 107, 0.24)',
      glow: 'rgba(255, 214, 107, 0.18)'
    },
    slate: {
      bg: 'linear-gradient(180deg, rgba(46, 64, 99, 0.95) 0%, rgba(35, 49, 78, 0.95) 100%)',
      activeBg: theme.colors.gradients.active,
      hover:
        'linear-gradient(180deg, rgba(56, 76, 116, 0.96) 0%, rgba(40, 57, 90, 0.96) 100%)',
      shadow: 'rgba(8, 15, 30, 0.4)',
      border: 'rgba(130, 180, 255, 0.16)',
      glow: 'rgba(76, 164, 255, 0.2)'
    }
  }

  const c = colors[color as keyof typeof colors] || colors.slate

  return css`
    background: ${active ? c.activeBg : c.bg};
    border: 1px solid ${active ? 'rgba(130, 200, 255, 0.28)' : c.border};
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 12px 22px ${c.shadow};
    color: white;

    &:hover:not(:disabled) {
      background: ${active ? c.activeBg : c.hover};
    }

    &:active:not(:disabled) {
      transform: translateY(2px);
    }

    ${active &&
    css`
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 0 0 1px rgba(130, 200, 255, 0.12),
        0 0 18px ${c.glow};
    `}

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      filter: saturate(0.8);
    }
  `
}

const shouldForwardButtonProp = (prop: string): boolean =>
  shouldForwardPositionProp(prop) && prop !== 'color' && prop !== 'active'

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => shouldForwardButtonProp(prop)
})<{ color: string; active: boolean } & PositionProps>`
  position: relative;
  width: 100%;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid transparent;
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  letter-spacing: 0.08em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.18s ease;
  overflow: hidden;

  ${(props) => getPositionStyles(props)}

  /* Apply dynamic styles */
  ${({ color, active, theme }) => getButtonStyles(color, active, theme)}
`
