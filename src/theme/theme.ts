import { createTheme, alpha } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    gauge: {
      good: string
      fair: string
      attention: string
      track: string
    }
  }
  interface PaletteOptions {
    gauge?: {
      good: string
      fair: string
      attention: string
      track: string
    }
  }
}

const SLATE_900  = '#0f1117'
const SLATE_800  = '#161b27'
const SLATE_750  = '#1c2233'
const SLATE_700  = '#232b3e'
const SLATE_600  = '#2e3a52'
const SLATE_400  = '#6b7a9a'
const SLATE_200  = '#c8d0e0'
const SLATE_100  = '#e8ecf4'
const AMBER      = '#f59e0b'
const AMBER_DARK = '#d97706'
const CYAN       = '#22d3ee'
const RED        = '#f87171'
const GREEN      = '#4ade80'
const YELLOW     = '#fbbf24'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: AMBER, dark: AMBER_DARK, contrastText: '#0f1117' },
    secondary: { main: CYAN },
    error:     { main: RED },
    warning:   { main: YELLOW },
    success:   { main: GREEN },
    background: {
      default: SLATE_900,
      paper:   SLATE_800,
    },
    text: {
      primary:   SLATE_100,
      secondary: SLATE_400,
    },
    divider: SLATE_600,
    gauge: {
      good:      GREEN,
      fair:      YELLOW,
      attention: RED,
      track:     SLATE_700,
    },
  },

  typography: {
    fontFamily: '"DM Sans", "Inter", system-ui, sans-serif',
    h1: { fontFamily: '"DM Mono", monospace', letterSpacing: '-0.02em' },
    h2: { fontFamily: '"DM Mono", monospace', letterSpacing: '-0.02em' },
    h3: { fontFamily: '"DM Mono", monospace', letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    overline: { letterSpacing: '0.12em', fontWeight: 600, fontSize: '0.68rem' },
  },

  shape: { borderRadius: 10 },

  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${SLATE_800}; }
        ::-webkit-scrollbar-thumb { background: ${SLATE_600}; border-radius: 3px; }
      `,
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderColor: SLATE_700,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${SLATE_700}`,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:hover': {
            borderColor: SLATE_400,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
          color: '#0f1117',
          '&:hover': {
            background: `linear-gradient(135deg, #fbbf24 0%, ${AMBER} 100%)`,
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.72rem' },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: SLATE_750,
            '& fieldset': { borderColor: SLATE_600 },
            '&:hover fieldset': { borderColor: SLATE_400 },
            '&.Mui-focused fieldset': { borderColor: AMBER },
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: SLATE_750,
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': { color: AMBER },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: SLATE_700 },
        head: {
          backgroundColor: SLATE_750,
          color: SLATE_400,
          fontWeight: 600,
          fontSize: '0.72rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: SLATE_600,
          fontSize: '0.75rem',
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: SLATE_700,
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: SLATE_800,
          borderRight: `1px solid ${SLATE_700}`,
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(SLATE_800, 0.92),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${SLATE_700}`,
          boxShadow: 'none',
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          border: `1px solid ${SLATE_600}`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 2,
          '&.Mui-selected': {
            backgroundColor: alpha(AMBER, 0.12),
            '&:hover': { backgroundColor: alpha(AMBER, 0.18) },
          },
          '&:hover': { backgroundColor: alpha(SLATE_100, 0.05) },
        },
      },
    },
  },
})
