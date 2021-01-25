import Axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, Fragment, useState } from "react";
import useSWR from "swr";
import Sidebar from "../../../components/Sidebar";
import { Sub, Post } from "../../../types";

export default function submit() {
  // Local state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Utils
  const router = useRouter();
  const { sub: subName } = router.query;
  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);

  if (error) router.push("/");

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();

    if (title.trim() === "") return;

    try {
      const { data: post } = await Axios.post<Post>("/posts", {
        title: title.trim(),
        body,
        sub: sub.name,
      });

      router.push(`/r/${sub.name}/${post.identifier}/${post.slug}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <Head>
        <title>Submit to Readdit</title>
      </Head>
      <div className="container flex pt-5">
        <div className="w-160">
          <div className="p-4 bg-white rounded">
            <h1 className="mb-3 text-lg">Submit a post to /r/{subName}</h1>
            <form onSubmit={submitPost}>
              <div className="relative mb-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Title"
                  maxLength={300}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div
                  style={{ top: 10, right: 10 }}
                  className="absolute mb-2 text-sm text-gray-500 select-none"
                >
                  {/* e.g. 15/300 */}
                  {title.trim().length}/300
                </div>
              </div>
              <textarea
                rows={4}
                placeholder="Text (optional)"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              ></textarea>
              <div className="flex justify-end">
                <button
                  className="px-3 py-1 blue button"
                  disabled={title.trim().length === 0}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
        {sub && <Sidebar sub={sub} />}
      </div>
    </Fragment>
  );
}
