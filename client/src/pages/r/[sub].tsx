import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment } from "react";
import useSWR from "swr";
import PostCard from "../../components/PostCard";
import Image from "next/image";
import { Sub } from "../../types";

export default function SubPage() {
  const router = useRouter();

  const subName = router.query.sub;

  const { data: sub, error } = useSWR<Sub>(subName ? `/subs/${subName}` : null);

  if (error) router.push("/");

  let postsMarkup;
  if (!sub) {
    postsMarkup = <p className="text-lg text-center">Loading...</p>;
  } else if (sub.posts.length === 0) {
    postsMarkup = <p className="text-lg text-center">No posts submitted yet</p>;
  } else {
    postsMarkup = sub.posts.map((post) => (
      <PostCard key={post.identifier} post={post} />
    ));
  }

  return (
    <div>
      <Head>
        <title>{sub?.title}</title>
      </Head>

      {sub && (
        <Fragment>
          {/* Sub info and images */}
          <div>
            {/* Banner image */}
            <div className="bg-blue-500">
              {sub.name}
              {sub.bannerUrl ? (
                <div
                  className="h-56"
                  style={{
                    backgroundImage: `url(${sub.bannerUrl})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></div>
              ) : (
                <div className="h-20 bg-blue-500"></div>
              )}
            </div>
            {/* Sub meta data */}
            <div className="h-20 bg-white">
              <div className="container flex">
                <Image
                  src={sub.bannerUrl}
                  alt=""
                  className="rounded-full"
                  width={80}
                  height={80}
                />
              </div>
            </div>
          </div>
          {/* Posts & Sidebar */}
          <div className="container flex pt-5">
            {sub && <div className="w-160">{postsMarkup}</div>}
          </div>
        </Fragment>
      )}
    </div>
  );
}
