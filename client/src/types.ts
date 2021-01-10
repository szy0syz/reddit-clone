export interface Post {
  identifier: string;
  title: string;
  slug: string;
  body: string;
  subName: string;
  username: string;
  createdAt: string;
  updatedAt: string;

  // virtual fields
  url: string;
  userVote?: number;
  voteScore?: number;
  commentCount?: number;
}
