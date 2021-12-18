import { AppProps } from 'next/app'
import 'react-spring-bottom-sheet/dist/style.css'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
