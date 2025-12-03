import styled from 'styled-components'
import { css } from 'styled-components'

export const HeaderContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: ${({ theme }) => theme.colors.gradients.card};
  backdrop-filter: blur(20px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.borders.primary};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 1000;
  font-family: ${({ theme }) => theme.typography.fontFamily};
`

export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  height: 45px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

export const LogoImage = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
`

export const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily};
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`

export const EngineStatus = styled.div<{ color: string }>`
  color: ${(props) => props.color};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  padding: 12px 20px;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
  min-width: 140px;
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all 0.3s ease;
  letter-spacing: 0.3px;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      45deg,
      ${(props) => props.color}20,
      transparent,
      ${(props) => props.color}20
    );
    border-radius: ${({ theme }) => theme.borderRadius.full};
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

export const DateTimeContainer = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  text-align: right;
  line-height: 1.4;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);

  .date,
  .time {
    margin: 2px 0;
    letter-spacing: 0.2px;
  }

  .date {
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .time {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
  }
`

export const StartStopButton = styled.button<{
  $isStart: boolean
  $isStop: boolean
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  justify-content: center;
  letter-spacing: 0.3px;
  color: ${({ theme }) => theme.colors.text.primary};

  /* Styles for Start button */
  ${({ $isStart, theme }) =>
    $isStart &&
    css`
      background: ${theme.colors.status.running};
      color: ${theme.colors.text.primary};
      box-shadow: ${theme.shadows.md};

      &:hover:not(:disabled) {
        background: ${theme.colors.status.running};
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.lg};
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: ${theme.shadows.sm};
      }
    `}

  /* Styles for Stop button */
  ${({ $isStop, theme }) =>
    $isStop &&
    css`
      background: ${theme.colors.status.stopped};
      color: ${theme.colors.text.primary};
      box-shadow: ${theme.shadows.md};

      &:hover:not(:disabled) {
        background: ${theme.colors.status.stopped};
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: ${theme.shadows.lg};
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: ${theme.shadows.sm};
      }
    `}

  /* Estado deshabilitado */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  /* Icono */
  svg {
    width: 16px;
    height: 16px;
  }
`
