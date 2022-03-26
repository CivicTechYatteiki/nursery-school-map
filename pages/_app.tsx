import { ThemeProvider } from '@mui/system'
import { AppProps } from 'next/app'
import Script from 'next/script'
import 'react-spring-bottom-sheet/dist/style.css'
import '../styles/globals.css'
import { appTheme } from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={appTheme}>
      {/* Global site tag (gtag.js) - Google Analytics */}
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-531RNJVJY8" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-531RNJVJY8'${process.env.NODE_ENV === 'development' ? ', {"debug_mode":true}' : ''});
        `}
      </Script>

      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
