import Head from "next/head";
import { Post, Sub } from "../types";
import PostCard from "../components/PostCard";
import useSWR, { useSWRInfinite } from "swr";
import Image from "next/image";
import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
// import { GetServerSideProps } from 'next';

export default function Home() {
  const [observedPost, setObservedPost] = useState("");
  // const { data: posts } = useSWR<Post[]>("/posts");

  const {
    data,
    error,
    mutate,
    size: page,
    setSize: setPage,
    isValidating,
    revalidate,
  } = useSWRInfinite<Post[]>((index) => `/posts?page=${index}`);
  const { data: topSubs } = useSWR("/misc/topSubs");

  const posts: Post[] = data ? [].concat(...data) : [];
  // const isLoadingInitialData = !data && !error;

  useEffect(() => {
    if (!posts || posts.length === 0) return;

    const id = posts[posts.length - 1].identifier;

    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);

  const observeElement = (element: HTMLElement) => {
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting === true) {
          console.log("Reached bottom of post");
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 } // 0 -> top, 1 -> bottom
    );
    observer.observe(element);
  };

  return (
    <Fragment>
      <Head>
        <title>readit: the front page of the internet</title>
      </Head>
      <div>
        <div className="container flex pt-4">
          {/* Posts feed */}
          <div className="w-160">
            {isValidating && <p className="text-lg text-center">Loading...</p>}
            {posts?.map((post) => (
              <PostCard
                post={post}
                key={post.identifier}
                revalidate={revalidate}
              />
            ))}
            {isValidating && posts?.length > 0 && (
              <p className="text-lg text-center">Loading...</p>
            )}
          </div>
          {/* Siderbar */}
          <div className="ml-6 w-80">
            <div className="bg-white rounded">
              <div className="p-4 border-b-2">
                <p className="text-lg font-semibold text-center">
                  Top Communities
                </p>
              </div>
              <div>
                {topSubs?.map((sub: Sub) => (
                  <div
                    key={sub.name}
                    className="flex items-center px-4 py-2 text-xs border-b"
                  >
                    <div className="mr-2 overflow-hidden rounded-full cursor-pointer">
                      <Link href={`/r/${sub.name}`}>
                        <Image
                          src={sub.imageUrl}
                          alt="Sub"
                          width={(6 * 16) / 4}
                          height={(6 * 16) / 4}
                        />
                      </Link>
                    </div>
                    <Link href={`/r/${sub.name}`}>
                      <a className="font-bold hover:cursor-pointer">
                        /r/{sub.name}
                      </a>
                    </Link>
                    <p className="ml-auto font-med">{sub.postCount}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   try {
//     const res = await Axios.get('/posts');
//     return {
//       props: { posts: res.data },
//     };
//   } catch (error) {
//     return { props: { error: 'Something went wrong' } };
//   }
// };
