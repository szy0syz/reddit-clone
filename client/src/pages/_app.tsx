import Axios from "axios";
import { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { AuthProvider } from "../context/auth";
import { SWRConfig } from "swr";

import "../styles/tailwind.css";
import "../styles/icons.css";

Axios.defaults.baseURL = "http://localhost:4000/api";
Axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <SWRConfig
      value={{
        fetcher: (url) => Axios.get(url).then((res) => res.data),
        dedupingInterval: 10 * 1000,
      }}
    >
      <AuthProvider>
        {!authRoute && <Navbar />}
        <Component {...pageProps} />
      </AuthProvider>
    </SWRConfig>
  );
}

export default App;
