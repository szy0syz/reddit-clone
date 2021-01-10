import Axios from "axios";
import { AppProps } from "next/app";
import { Fragment } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/router";

import "../styles/tailwind.css";
import "../styles/icons.css";

Axios.defaults.baseURL = "http://localhost:5000/api";
Axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname);

  return (
    <Fragment>
      {!authRoute && <Navbar />}
      <Component {...pageProps} />
    </Fragment>
  );
}

export default App;
