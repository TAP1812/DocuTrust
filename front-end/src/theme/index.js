import { createTheme, alpha } from '@mui/material/styles';

const themeColors = {
  primary: {
    main: '#2B5FD3',
    light: '#4C7BE5',
    dark: '#1E45A0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00B3C7',
    light: '#33C4D4',
    dark: '#007D8A',
    contrastText: '#ffffff',
  },
  error: {
    main: '#DC3545',
    light: '#E35D6A',
    dark: '#B02A37',
  },
  warning: {
    main: '#FFC107',
    light: '#FFCD39',
    dark: '#CC9A06',
  },
  info: {
    main: '#0072CE',
    light: '#3391D8',
    dark: '#005A9E',
  },
  success: {
    main: '#28A745',
    light: '#53B96A',
    dark: '#1F8034',
  },
  grey: {
    100: '#F8FAFD',
    200: '#EDF2F7',
    300: '#E2E8F0',
    400: '#CBD5E0',
    500: '#A0AEC0',
    600: '#718096',
    700: '#4A5568',
    800: '#2D3748',
    900: '#1A202C',
  },
  background: {
    default: '#F8FAFD',
    paper: '#FFFFFF',
    dark: '#1A202C',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
  },
};

const theme = createTheme({
  palette: {
    ...themeColors,
    mode: 'light',
  },
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.57,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 6,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.1)',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.1)',
    '0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px -4px rgba(0, 0, 0, 0.1)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 24px',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        containedPrimary: {
          background: themeColors.primary.main,
          '&:hover': {
            backgroundColor: themeColors.primary.dark,
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${themeColors.grey[200]}`,
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: themeColors.text.primary,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#FFFFFF',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: themeColors.primary.main,
              borderWidth: '2px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: themeColors.primary.main,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 600,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: alpha(themeColors.primary.main, 0.1),
            color: themeColors.primary.dark,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: alpha(themeColors.secondary.main, 0.1),
            color: themeColors.secondary.dark,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: alpha(themeColors.success.main, 0.1),
            color: themeColors.success.dark,
          },
          '&.MuiChip-colorError': {
            backgroundColor: alpha(themeColors.error.main, 0.1),
            color: themeColors.error.dark,
          },
        },
      },
    },
  },
});

export default theme; 