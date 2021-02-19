import { GetServerSideProps } from "next";
import Head from "next/head";
import { FormEvent, useState } from "react";
import Axios from "axios";
import cls from "classnames";
import { useRouter } from "next/router";

export default function create() {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  const [errors, setErrors] = useState<Partial<any>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const res = await Axios.post('/subs', { name, title, description });

      router.push(`/r/${res.data.name}`)
    } catch (error) {
      console.log(error);
      setErrors(error.response.data);
    }
  }

  return (
    <>
      <Head>
        <title>Create a Communtity</title>
      </Head>
      <div className="flex bg-white">
        <div
          className="h-screen bg-center bg-cover w-36"
          style={{ backgroundImage: "url('/images/bricks.jpg')" }}
        ></div>
        <div className="flex flex-col justify-center pl-6">
          <div className="w-98">
            <h1 className="mb-2 text-lg font-medium">Create a Communtity</h1>
            <hr />
            <form onSubmit={handleSubmit}>
              <div className="my-6">
                <p className="font-medium">Name</p>
                <p className="mb-2 text-xs text-gray-500">
                  Communtity names including capitalization cannot be changed.
                </p>
                <input
                  type="text"
                  className={cls(
                    "w-full p-3 border border-gray-200 rounded hover:border-gray-500",
                    {
                      "border-red-600": errors.name,
                    }
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <small className="font-medium text-red-500">
                  {errors.name}
                </small>
              </div>
              <div className="my-6">
                <p className="font-medium">Title</p>
                <p className="mb-2 text-xs text-gray-500">
                  Communtity title repersent the topic an you change it at any
                  time.
                </p>
                <input
                  type="text"
                  className={cls(
                    "w-full p-3 border border-gray-200 rounded hover:border-gray-500",
                    {
                      "border-red-600": errors.name,
                    }
                  )}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <small className="font-medium text-red-500">
                  {errors.title}
                </small>
              </div>
              <div className="my-6">
                <p className="font-medium">Description</p>
                <p className="mb-2 text-xs text-gray-500">
                  This is how new members come to understand your community.
                </p>
                <textarea
                  className={cls(
                    "w-full p-3 border border-gray-200 rounded hover:border-gray-500",
                    { "border-red-600": errors.description }
                  )}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <small className="font-medium text-red-600">
                  {errors.description}
                </small>
              </div>
              <div className="flex justify-end">
                <button className="px-4 py-1 text-sm font-semibold capitalize blue button">
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) throw new Error("Missing auth token cookie");

    await Axios.get("/auth/me", { headers: { cookie } });

    return { props: {} };
  } catch (error) {
    res.writeHead(307, { Location: "/login" }).end();
    return { props: {} };
  }
};
