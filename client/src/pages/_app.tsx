import Axios from "axios";
import { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { AuthProvider } from "../context/auth";
import { SWRConfig } from "swr";

import "../styles/icons.css";
import "../styles/tailwind.css";

Axios.defaults.baseURL = "http://localhost:4000/api";
Axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
  try {
    const res = await Axios.get(url);
    return res.data;
  } catch (error) {
    // swr 会接住这个异常
    throw error.response.data;
  }
};

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10 * 1000,
      }}
    >
      <AuthProvider>
        {!authRoute && <Navbar />}
        <div className={authRoute ? "" : "pt-12"}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  );
}

export default App;
