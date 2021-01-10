import dayjs from 'dayjs';
import React, { Fragment } from 'react';
import Link from 'next/link';
import relativeTime from 'dayjs/plugin/relativeTime';
import Axios from 'axios';
import classNames from 'classnames';
import { Post } from '../types';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: Post;
}

const ActionButton = ({ children }) => {
  return (
    <div className="px-1 py-1 mr-1 text-xs text-gray-400 rounded cursor-pointer hover:bg-gray-200">
      {children}
    </div>
  );
};

export default function PostCard({ post }: PostCardProps) {
  const vote = async (value) => {
    try {
      const res = await Axios.post('/misc/vote', {
        value,
        slug: post.slug,
        identifier: post.identifier,
      });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex mb-4 bg-white rounded">
      {/* vote section */}
      <div className="w-10 py-3 text-center bg-gray-200 rounded-lg">
        {/* Upvote */}
        <div
          onClick={() => vote(1)}
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
        >
          <i
            className={classNames('icon-arrow-up', {
              'text-red-500': post.userVote === 1,
            })}
          ></i>
        </div>
        <p>{post.voteScore}</p>
        {/* Downvote */}
        <div
          onClick={() => vote(-1)}
          className="w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
        >
          <i
            className={classNames('icon-arrow-down', {
              'text-blue-600': post.userVote === -1,
            })}
          ></i>
        </div>
      </div>
      {/* Post data section */}
      <div className="w-full p-2">
        <div className="flex items-center">
          <Link href={`/r/${post.subName}`}>
            <Fragment>
              <img
                src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                className="w-6 h-6 mr-1 rounded-full cursor-pointer"
              />
              <a className="text-xs font-bold cursor-pointer hover:underline">
                /r/{post.subName}
              </a>
            </Fragment>
          </Link>
          <p className="text-xs text-gray-500">
            <span className="mx-1">•</span>
            Posted by
            <Link href={`{/u/${post.username}}`}>
              <a href="" className="mx-1 hover:underline">
                /u/post.username
              </a>
            </Link>
            <Link href={post.url}>
              <a className="mx-1 hover:underline">
                {dayjs(post.createdAt).fromNow()}
              </a>
            </Link>
          </p>
        </div>
        <Link href={post.url}>
          <a className="my-1 text-lg font-medium">{post.title}</a>
        </Link>
        {post.body && <p className="my-1 text-sm">post.body</p>}
        <div className="flex">
          <Link href={post.url}>
            <a>
              <ActionButton>
                <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                <span className="font-bold">{post.commentCount} Comments</span>
              </ActionButton>
            </a>
          </Link>
          <ActionButton>
            <i className="mr-1 fas fa-share fa-xs"></i>
            <span className="font-bold">Share</span>
          </ActionButton>
          <ActionButton>
            <i className="mr-1 fas fa-bookmark fa-xs"></i>
            <span className="font-bold">Save</span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
