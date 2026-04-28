export const theme = {
  colors: {
    background: {
      primary: '#071120',
      secondary: '#0b1528',
      tertiary: '#101c31',
      overlay: 'rgba(7, 17, 32, 0.82)'
    },
    text: {
      primary: '#eef4ff',
      secondary: '#aab7d1',
      disabled: '#5f7293',
      inverse: '#08111f'
    },
    accent: {
      primary: '#67d6ff',
      secondary: '#48bfff',
      success: '#4bd27b'
    },
    status: {
      running: '#97f2a8',
      stopped: '#ff6a6a',
      warning: '#ffd66b',
      alarm: '#ff6a6a',
      info: '#6aa8ff'
    },
    borders: {
      primary: 'rgba(120, 170, 255, 0.16)',
      secondary: 'rgba(120, 170, 255, 0.1)',
      active: '#67d6ff'
    },
    gradients: {
      card: 'linear-gradient(180deg, rgba(18, 30, 52, 0.96) 0%, rgba(10, 18, 33, 0.96) 100%)',
      active:
        'linear-gradient(180deg, rgba(68, 117, 205, 0.98) 0%, rgba(47, 87, 170, 0.98) 100%)'
    }
  },
  typography: {
    fontFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
    bodyFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
    displayFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
    numericFamily: "'Rajdhani', 'Segoe UI', 'Inter', sans-serif",
    sizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px'
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700
    }
  },
  shadows: {
    sm: '0 6px 16px rgba(0, 0, 0, 0.18)',
    md: '0 10px 24px rgba(0, 0, 0, 0.3)',
    lg: '0 18px 42px rgba(0, 0, 0, 0.36)',
    glow: '0 0 18px rgba(72, 191, 255, 0.22)'
  },
  borderRadius: {
    sm: '10px',
    md: '14px',
    lg: '18px',
    full: '9999px'
  }
}

export type Theme = typeof theme
