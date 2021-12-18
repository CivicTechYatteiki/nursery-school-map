import { ThemeProvider } from '@mui/system'
import { AppProps } from 'next/app'
import 'react-spring-bottom-sheet/dist/style.css'
import '../styles/globals.css'
import { appTheme } from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
