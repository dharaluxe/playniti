import type { AppProps } from 'next/app';
import '../styles/glass.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
