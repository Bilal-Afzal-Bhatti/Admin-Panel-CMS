// src/theme/index.js
import { createTheme } from '@mui/material/styles';

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main:  '#4F46E5',
        light: '#818CF8',
        dark:  '#3730A3',
      },
      secondary: {
        main:  '#10B981',
        light: '#34D399',
        dark:  '#059669',
      },
      background: {
        default: mode === 'light' ? '#F9FAFB'  : '#0F0F1A',
        paper:   mode === 'light' ? '#FFFFFF'  : '#1A1A2E',
      },
      text: {
        primary:   mode === 'light' ? '#111827' : '#F3F4F6',
        secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
      },
      divider: mode === 'light' ? '#E5E7EB' : '#2D2D44',
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem',  fontWeight: 600 },
      h2: { fontSize: '2rem',    fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontSize: '1.5rem',  fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem',    fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#1E1E2D' : '#12121F',
            color: '#FFFFFF',
            borderRight: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#1A1A2E',
            color:           mode === 'light' ? '#111827' : '#F3F4F6',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          },
        },
      },
    },
  });

export default getTheme;