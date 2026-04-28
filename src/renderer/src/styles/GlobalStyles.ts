import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    background:
      radial-gradient(circle at top center, rgba(83, 136, 236, 0.26), transparent 340%),
      linear-gradient(180deg, #0b1730 0%, #13203a 42%, #0d1730 100%);
    color: ${({ theme }) => theme.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: 0.02em;
    overflow: hidden; /* Prevent scrolling on the main body, handle in HMI container if needed */
  }

  button,
  input,
  select,
  textarea {
    font-family: inherit;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(14, 26, 48, 0.92);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(110, 158, 228, 0.56);
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(122, 223, 255, 0.66);
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
