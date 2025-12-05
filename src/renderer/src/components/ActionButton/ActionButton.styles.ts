import styled, { css, RuleSet } from 'styled-components'
import { getPositionStyles, PositionProps, shouldForwardPositionProp } from 'styles/mixins'
import { Theme } from 'styles/theme'

export const getButtonStyles = (color: string, active: boolean, theme: Theme): RuleSet<object> => {
  const colors = {
    green: {
      bg: theme.colors.status.running,
      hover: '#059669', // Emerald 600
      shadow: '#064e3b' // Emerald 900
    },
    red: {
      bg: theme.colors.status.alarm,
      hover: '#e11d48', // Rose 600
      shadow: '#881337' // Rose 900
    },
    yellow: {
      bg: theme.colors.status.warning,
      hover: '#d97706', // Amber 600
      shadow: '#78350f' // Amber 900
    },
    slate: {
      bg: theme.colors.background.tertiary,
      hover: theme.colors.background.secondary,
      shadow: '#0f172a' // Slate 900
    }
  }

  const c = colors[color as keyof typeof colors] || colors.slate

  return css`
    background-color: ${c.bg};
    border-bottom: 4px solid ${c.shadow}80;
    color: white;

    &:hover:not(:disabled) {
      background-color: ${c.hover};
    }

    &:active:not(:disabled) {
      border-bottom-width: 0;
      transform: translateY(4px);
    }

    ${active &&
    css`
      box-shadow:
        0 0 0 2px ${theme.colors.background.primary},
        0 0 0 4px white;
    `}

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      filter: grayscale(1);
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
  border: none;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  letter-spacing: 1px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.1s ease;
  overflow: hidden;

  ${(props) => getPositionStyles(props)}

  /* Apply dynamic styles */
  ${({ color, active, theme }) => getButtonStyles(color, active, theme)}
`
