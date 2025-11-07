import '@fontsource/work-sans/300.css';
import '@fontsource/work-sans/400.css';
import '@fontsource/work-sans/500.css';
import '@fontsource/work-sans/600.css';
import '@fontsource/work-sans/700.css';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#FCFCF8',
      paper: '#FCFCF8',
    },
    primary: {
      main: '#6A6060',
    },
    secondary: {
      main: '#B8B7B7',
    },
    text: {
      primary: '#423C3C',
      secondary: '#6A6060',
    },
  },
  typography: {
    fontFamily: '"Work Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.75rem',
      fontWeight: 300,
      letterSpacing: '0.08em',
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 300,
      letterSpacing: '0.08em',
    },
    h3: {
      fontSize: '2.125rem',
      fontWeight: 400,
      letterSpacing: '0.06em',
    },
    subtitle1: {
      fontSize: '1.1rem',
      letterSpacing: '0.4em',
      textTransform: 'uppercase',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    button: {
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: 'none',
          paddingInline: '1.75rem',
          paddingBlock: '0.875rem',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'lg',
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FCFCF8',
          color: '#423C3C',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        },
        html: {
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        },
        a: {
          color: 'inherit',
          textDecorationColor: 'transparent',
          transition: 'opacity 0.3s ease-in-out',
        },
        'a:hover': {
          opacity: 0.7,
        },
      },
    },
  },
});

export default theme;
