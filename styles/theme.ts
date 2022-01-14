import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

export const blue = {
  90: '#066EA9',
  60: '#0E96F8',
  50: '#31A8FF',
  20: '#B5E7F7',
  10: '#EDF9FF',
}

// Create a theme instance.
export const appTheme = createTheme({
  typography: {
    fontFamily: ['Roboto', 'Noto Sans JP', 'sans-serif'].join(','),
    h1: { fontWeight: 400 },
    h2: { fontWeight: 400 },
    h3: { fontWeight: 500 },
    h4: { fontWeight: 500 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 500 },
    overline: { fontWeight: 500 },
  },
  palette: {
    primary: {
      main: blue[50],
      contrastText: blue[60],
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          '&:first-letter': {
            fontSize: '1.5rem',
          },
        },
      },
    },
  },
})
