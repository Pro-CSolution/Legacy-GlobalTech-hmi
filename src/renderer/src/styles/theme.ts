export const theme = {
  colors: {
    background: {
      primary: '#111927', // Main canvas background (Deep Blue/Grey)
      secondary: '#1e293b', // Component background
      tertiary: '#334155', // Cards/Modals
      overlay: 'rgba(17, 25, 39, 0.8)'
    },
    text: {
      primary: '#f8fafc', // High emphasis
      secondary: '#94a3b8', // Medium emphasis
      disabled: '#475569', // Disabled
      inverse: '#111927'
    },
    accent: {
      primary: '#06b6d4', // Cyan (Modern look)
      secondary: '#3b82f6', // Blue
      success: '#10b981' // Emerald
    },
    status: {
      running: '#10b981',
      stopped: '#ef4444',
      warning: '#f59e0b',
      alarm: '#ef4444',
      info: '#3b82f6'
    },
    borders: {
      primary: '#334155',
      secondary: '#1e293b',
      active: '#06b6d4'
    },
    gradients: {
      card: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
      active: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)'
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
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
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    glow: '0 0 15px rgba(6, 182, 212, 0.5)'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px'
  }
}

export type Theme = typeof theme
