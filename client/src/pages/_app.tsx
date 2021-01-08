import { AppProps } from 'next/app';
import Axios from 'axios';

import '../styles/tailwind.css';

Axios.defaults.baseURL = 'http://localhost:5000/api';
Axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default App;
