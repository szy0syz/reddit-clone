import Axios from "axios";
import { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";
import { AuthProvider } from "../context/auth";

import "../styles/tailwind.css";
import "../styles/icons.css";

Axios.defaults.baseURL = "http://localhost:4000/api";
Axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <AuthProvider>
      {!authRoute && <Navbar />}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default App;
