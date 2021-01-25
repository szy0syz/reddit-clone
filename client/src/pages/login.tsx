import Axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";
import { useAuthDispatch, useAuthState } from "../context/auth";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<any>({});

  const router = useRouter();
  const dispatch = useAuthDispatch();
  const { authenticated } = useAuthState();

  if (authenticated) router.push("/");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post(
        "/auth/login",
        {
          password,
          username,
        },
        {
          withCredentials: true,
        }
      );

      // payload 只要 userInfo 对象就行了
      dispatch("LOGIN", res.data?.user);

      router.back();
    } catch (error) {
      console.error(error);
      setErrors(error?.response?.data || {});
    }
  };

  return (
    <div className="flex bg-white">
      <Head>
        <title>Login - Reddit</title>
      </Head>

      <div
        className="h-screen bg-center bg-cover w-36"
        style={{ backgroundImage: "url('/images/bricks.jpg')" }}
      ></div>

      <div className="flex flex-col justify-center pl-6">
        <div className="w-70">
          <h1 className="mb-2 text-lg font-medium">Login</h1>
          <p className="mb-10 text-xs">
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-400">
              User Agreement
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400">
              Privacy Policy
            </a>
            .
          </p>
          <form onSubmit={handleSubmit}>
            <InputGroup
              placeholder="Username"
              value={username}
              setValue={setUsername}
              error={errors.username}
            />
            <InputGroup
              placeholder="Password"
              value={password}
              type="password"
              setValue={setPassword}
              error={errors.password}
            />
            <button className="w-full py-2 mb-4 text-xs font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded">
              Login
            </button>
          </form>
          <small>
            New to Readit?
            <Link href="/register">
              <a className="ml-1 text-blue-500 uppercase">Sign Up</a>
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
}
