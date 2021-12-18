import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

export const blue = {
  90: '#31A8FF',
  30: '#B5E7F7',
  10: '#EDF9FF',
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: blue[90],
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

export default theme
