import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

export const blue = {
  90: '#066EA9',
  50: '#31A8FF',
  20: '#B5E7F7',
  10: '#EDF9FF',
}

// Create a theme instance.
export const appTheme = createTheme({
  palette: {
    primary: {
      main: blue[50],
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
})
