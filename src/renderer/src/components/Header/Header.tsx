import {
  HeaderContainer,
  LogoContainer,
  LogoImage,
  Title,
  DateTimeContainer,
  EngineStatus,
  StartStopButton
} from './Header.styles'
import { FaCog, FaStop } from 'react-icons/fa'

interface HeaderProps {
  title: string
  logo?: string
  status?: {
    text: string
    color: string
  }
  onStart?: () => void
  onStop?: () => void
  showStartStop?: boolean
}

const Header = ({ title, logo, status, onStart, onStop, showStartStop = false }: HeaderProps) => {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const isStartButton = status?.text === 'Stopped' || !status
  const isStopButton = status?.text === 'Running'
  const isDisabled = status?.text === 'Starting' || status?.text === 'Stopping'

  const handleStartStop = () => {
    if (isStartButton && onStart) {
      onStart()
    } else if (isStopButton && onStop) {
      onStop()
    }
  }

  return (
    <HeaderContainer>
      {logo && (
        <LogoContainer>
          <LogoImage src={logo} alt="Logo" />
        </LogoContainer>
      )}

      <Title>{title}</Title>

      {showStartStop && (
        <StartStopButton
          onClick={handleStartStop}
          disabled={isDisabled}
          $isStart={isStartButton}
          $isStop={isStopButton}
        >
          {isStartButton ? <FaCog /> : <FaStop />}
          {isStartButton ? 'Start Sequence' : 'Stop'}
        </StartStopButton>
      )}

      {status && <EngineStatus color={status.color}>{status.text}</EngineStatus>}

      <DateTimeContainer>
        <div className="date">Date: {formattedDate}</div>
        <div className="time">Time: {formattedTime}</div>
      </DateTimeContainer>
    </HeaderContainer>
  )
}

export default Header
