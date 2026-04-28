import styled, { keyframes, css } from 'styled-components'
import { HMI_CONFIG } from 'config/constants'

const pulse = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const HeaderContainer = styled.header`
  height: ${HMI_CONFIG.UI.HEADER_HEIGHT}px;
  background: linear-gradient(180deg, rgba(15, 26, 46, 0.96) 0%, rgba(10, 20, 36, 0.96) 100%);
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  backdrop-filter: blur(8px);
  position: relative; /* enable z-index (keep header above screen overlays) */
  z-index: 50;
  box-shadow:
    ${({ theme }) => theme.shadows.md},
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  flex-shrink: 0;
`

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
  min-width: 0;
`

export const BrandGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
`

export const BrandImageWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  padding: 4px 0;
  margin-bottom: 15px;
`

export const BrandImage = styled.img`
  display: block;
  height: 70px;
  width: auto;
  max-width: 360px;
  object-fit: contain;
  mix-blend-mode: normal;
  opacity: 1;
`

export const HeaderNoticeDock = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  max-width: calc(100% - 760px);
`

export const HeaderNoticePill = styled.div<{ $tone: 'success' | 'error'; $visible: boolean }>`
  width: max-content;
  min-width: 0;
  max-width: min(100%, 720px);
  padding: 14px 18px;
  border-radius: 16px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'success' ? 'rgba(151, 242, 168, 0.28)' : 'rgba(255, 106, 106, 0.3)'};
  background: ${({ $tone }) =>
    $tone === 'success'
      ? 'linear-gradient(180deg, rgba(24, 53, 39, 0.9), rgba(16, 37, 28, 0.94))'
      : 'linear-gradient(180deg, rgba(70, 28, 28, 0.94), rgba(44, 18, 18, 0.96))'};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  line-height: 1.35;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 28px rgba(8, 15, 30, 0.3);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '-8px')});
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
  pointer-events: none;
`

export const HeaderNoticeText = styled.div`
  min-width: 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.02em;
  line-height: 1.45;
  max-width: 620px;
`

export const RecordButton = styled.button<{ $isRecording: boolean }>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme, $isRecording }) => ($isRecording ? '#ef4444' : theme.colors.text.secondary)};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;

  /* IMPORTANT: We use a CSS variable for progress to avoid generating new styled-components classes
     on every tick (which can crash the Electron renderer). */
  ${({ theme, $isRecording }) =>
    $isRecording
      ? css`
          border: 2px solid transparent;
          background:
            linear-gradient(rgba(25, 39, 66, 0.96), rgba(18, 29, 48, 0.96)) padding-box,
            conic-gradient(#ef4444 var(--record-progress-deg, 0deg), rgba(120, 170, 255, 0.18) 0deg)
              border-box;
        `
      : css`
          border: 1px solid ${theme.colors.borders.primary};
          background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
        `}

  &:hover {
    ${({ theme, $isRecording }) =>
      $isRecording
        ? css`
            background:
              linear-gradient(rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.15)) padding-box,
              conic-gradient(
                  #ef4444 var(--record-progress-deg, 0deg),
                  ${theme.colors.borders.primary} 0deg
                )
                border-box;
          `
        : css`
            background: linear-gradient(180deg, rgba(32, 49, 80, 0.96), rgba(22, 35, 58, 0.96));
            border-color: ${theme.colors.accent.primary};
          `}
    color: ${({ theme, $isRecording }) => ($isRecording ? '#ef4444' : theme.colors.text.primary)};
  }

  ${({ $isRecording }) =>
    $isRecording &&
    css`
      &::after {
        content: '';
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #ef4444;
        top: 6px;
        right: 6px;
        animation: ${pulse} 1.5s infinite ease-in-out;
      }
    `}
`

export const SendStatusPill = styled.div<{ $tone: 'sending' | 'success' | 'error' }>`
  height: 60px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'error') return `${theme.colors.status.alarm}66`
      if ($tone === 'success') return `${theme.colors.status.running}66`
      return `${theme.colors.accent.primary}66`
    }};
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  min-width: 170px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`

export const SendSpinner = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: ${({ theme }) => theme.colors.accent.primary};
  animation: ${spin} 0.9s linear infinite;
`

export const SendStatusText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.1;
`

export const SendStatusTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
`

export const SendStatusMsg = styled.div`
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const Badge = styled.div`
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: 60px;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`

export const BadgeLabel = styled.span`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1.1;
`

export const BadgeValue = styled.span`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: 0.06em;
  line-height: 1.3;
`

export const Divider = styled.div`
  height: 48px;
  width: 1px;
  background: ${({ theme }) => theme.colors.borders.primary};
  flex-shrink: 0;
`

export const InfoText = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.3;
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  span.separator {
    color: ${({ theme }) => theme.colors.borders.primary};
  }
`

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 24px;
  flex-shrink: 0;
`

export const Time = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.1;
  letter-spacing: 0.06em;
`

export const DateText = styled.div`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1.3;
`

export const TimeBlock = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
`

export const AlarmButton = styled.button<{ $tone: 'ok' | 'warning' | 'alarm' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 54px;
  min-width: 220px;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  box-shadow: ${({ $tone, theme }) => {
    if ($tone === 'alarm') return `0 0 0 2px ${theme.colors.status.alarm}66`
    if ($tone === 'warning') return `0 0 0 2px ${theme.colors.status.warning}66`
    return 'none'
  }};

  &:hover {
    background: linear-gradient(180deg, rgba(32, 49, 80, 0.96), rgba(22, 35, 58, 0.96));
  }

  &:active {
    transform: scale(0.99);
  }
`

export const AlarmIconWrap = styled.div<{ $tone: 'ok' | 'warning' | 'alarm' }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ theme, $tone }) => {
    if ($tone === 'alarm') return `${theme.colors.status.alarm}22`
    if ($tone === 'warning') return `${theme.colors.status.warning}22`
    return `${theme.colors.accent.primary}1A`
  }};
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'alarm') return `${theme.colors.status.alarm}66`
      if ($tone === 'warning') return `${theme.colors.status.warning}66`
      return `${theme.colors.borders.primary}`
    }};
  color: ${({ theme, $tone }) => {
    if ($tone === 'alarm') return theme.colors.status.alarm
    if ($tone === 'warning') return theme.colors.status.warning
    return theme.colors.accent.primary
  }};
`

export const AlarmInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  text-align: left;
  flex: 1;
  min-width: 0;
`

export const AlarmCounts = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`

export const AlarmAge = styled.div`
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.secondary};
  letter-spacing: 0.06em;
  line-height: 1.3;
`

export const CommGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
`

export const CommPill = styled.div<{ $tone: 'ok' | 'off' | 'warning' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  height: 54px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
  border: 1px solid
    ${({ theme, $tone }) => {
      if ($tone === 'off') return `${theme.colors.status.alarm}66`
      if ($tone === 'warning') return `${theme.colors.status.warning}66`
      return `${theme.colors.status.running}66`
    }};
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`

export const CommDot = styled.div<{ $tone: 'ok' | 'off' | 'warning' }>`
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  background: ${({ theme, $tone }) => {
    if ($tone === 'off') return theme.colors.status.alarm
    if ($tone === 'warning') return theme.colors.status.warning
    return theme.colors.status.running
  }};
  box-shadow: ${({ theme, $tone }) => {
    if ($tone === 'ok') return `0 0 10px ${theme.colors.status.running}88`
    return 'none'
  }};
  flex-shrink: 0;
`

export const CommText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1;
  justify-content: center;
`

export const CommTitle = styled.div`
  font-size: 10px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.1;
`

export const CommValue = styled.div`
  font-family: ${({ theme }) => theme.typography.displayFamily};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`

export const CommSub = styled.div`
  font-family: ${({ theme }) => theme.typography.bodyFamily};
  font-size: 12px;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.3;
`

export const ConfigButton = styled.button`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(25, 39, 66, 0.95), rgba(18, 29, 48, 0.95));
  border: 1px solid ${({ theme }) => theme.colors.borders.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: linear-gradient(180deg, rgba(32, 49, 80, 0.96), rgba(22, 35, 58, 0.96));
    color: ${({ theme }) => theme.colors.accent.primary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
  }
`
