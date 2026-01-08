import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background-color: ${({ theme }) => theme.colors.background.primary};
    color: ${({ theme }) => theme.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden; /* Prevent scrolling on the main body, handle in HMI container if needed */
  }

  button {
    font-family: inherit;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.borders.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.secondary};
  }

  /* Utility: spin animation (used by lucide icons with className="animate-spin") */
  @keyframes hmi-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: hmi-spin 1s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-spin {
      animation: none;
    }
  }
`
