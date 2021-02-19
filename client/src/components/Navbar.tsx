import Link from "next/link";
import RedditLogo from "../images/reddit.svg";
import { useAuthState, useAuthDispatch } from "../context/auth";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import Axios from "axios";
import { Sub } from "../types";
import { useRouter } from "next/router";

export const Navbar: React.FC = () => {
  const dispatch = useAuthDispatch();
  const [timer, setTimer] = useState(null);
  const [name, setName] = useState("");
  const [subs, setSubs] = useState<Sub[]>([]);
  const { loading, authenticated } = useAuthState();

  const router = useRouter();

  const logout = () => {
    Axios.post("/auth/logout")
      .then(() => {
        dispatch("LOGOUT");
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const searchSubs = async (subName: string) => {
    clearTimeout(timer);
    setTimer(
      setTimeout(async () => {
        try {
          const { data } = await Axios.get(`/subs/search/${subName}`);

          if (name.trim() === "") {
            setSubs([]);
            return;
          }

          setSubs(data);

          console.log(data);
        } catch (error) {
          console.log(error);
        }
      }, 330)
    );
  };

  useEffect(() => {
    if (name.trim() === "") {
      setSubs([]);
      return;
    }
    searchSubs(name);
  }, [name]);

  const goToSub = (sub: Sub) => {
    console.log("~~sub", sub);
    router.push(`/r/${sub.name}`);
    setName("");
  };

  return (
    <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-center h-12 px-5 bg-white">
      {/* Logo and title */}
      <div className="flex items-center">
        <Link href="/">
          <a>
            <RedditLogo className="w-8 h-8 mr-2" />
          </a>
        </Link>
        <span className="text-2xl font-semibold">
          <Link href="/">readit</Link>
        </span>
      </div>
      {/* Search input */}
      <div className="relative flex items-center mx-auto bg-gray-100 border rounded hover:border-blue-500 hover:bg-white">
        <i className="pl-4 pr-3 text-gray-500 fas fa-search"></i>
        <input
          type="text"
          placeholder="Search"
          className="py-1 pr-3 bg-transparent rounded w-160 focus:outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div
          className="absolute left-0 right-0 bg-white"
          style={{ top: "100%" }}
        >
          {subs?.map((sub) => (
            <div
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-200"
              onClick={() => goToSub(sub)}
            >
              <Image
                className="rounded-full"
                src={sub.imageUrl}
                alt="Sub"
                width={(8 * 16) / 4}
                height={(8 * 16) / 4}
              />
              <div className="ml-4 text-sm">
                <p className="font-medium">{sub.name}</p>
                <p className="text-gray-600">{sub.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Auth buttons */}
      <div className="flex">
        {!loading &&
          (authenticated ? (
            // Show logout
            <button
              className="w-32 py-1 mr-4 leading-5 hollow blue button"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <Fragment>
              <Link href="/login">
                <a className="w-32 py-1 mr-4 leading-5 hollow blue button">
                  log in
                </a>
              </Link>
              <Link href="/register">
                <a className="w-32 py-1 leading-5 blue button">sign up</a>
              </Link>
            </Fragment>
          ))}
      </div>
    </div>
  );
};

export default Navbar;
