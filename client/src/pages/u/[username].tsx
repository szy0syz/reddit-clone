import React from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import Head from "next/head";
import PostCard from "../../components/PostCard";
import { Comment, Post } from "../../types";
import Link from "next/link";
import dayjs from "dayjs";

export default function user() {
  const router = useRouter();
  const username = router.query.username;

  const { data, error } = useSWR<any>(username ? `/users/${username}` : null);

  if (error) router.push("/");

  return (
    <>
      <Head>
        <title>{data?.user.username}</title>
      </Head>
      {data && (
        <div className="container flex pt-5">
          <div className="w-160" style={{ marginTop: "-1rem" }}>
            {data.submissions.map((submission: any) => {
              if (submission.type === "Post") {
                const post: Post = submission;
                return <PostCard key={post.identifier} post={post} />;
              } else {
                const comment: Comment = submission;
                return (
                  <div
                    key={comment.identifier}
                    className="flex my-4 bg-white rounded"
                  >
                    <div className="flex-shrink-0 w-10 py-10 text-center bg-gray-200 rounded-l">
                      <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
                    </div>
                    <div className="w-full p-2">
                      <p className="mb-2 text-xs text-gray-500">
                        {/* <Link href={`/u/${comment.username}`}>
                          <a className="text-blue-500 cursor-pointer hover:underline">{comment.username}</a>
                        </Link> */}
                        {comment.username}
                        <span> commented on </span>
                        <Link href={`/u/${comment.post.url}`}>
                          <a className="font-semibold text-blue-400 cursor-pointer hover:underline">
                            {comment.post.title}
                          </a>
                        </Link>
                        <span className="mx-1">•</span>
                        <Link href={`/r/${comment.post.subName}`}>
                          <a className="text-black cursor-pointer hover:underline">
                            /r/{comment.post.subName}
                          </a>
                        </Link>
                      </p>
                      <hr />
                      <p className="p-1">{comment.body}</p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
          <div className="ml-6 w-80">
            <div className="bg-white rounded">
              <div className="p-3 bg-blue-500 rounded-t">
                <img
                  src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                  alt="user profile"
                  className="w-16 h-16 mx-auto border-2 border-white rounded-full"
                />
              </div>
              <div className="p-3 text-center">
                <h1 className="mb-4 text-xl">{data.user.username}</h1>
                <hr />
                <p className="mt-3">
                  Joined {dayjs(data.user.createdAt).format("MMM YYYY")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
