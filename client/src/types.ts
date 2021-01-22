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

export interface User {
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sub {
  createdAt: string
  updatedAt: string
  name: string
  title: string
  description: string
  imageUrn: string
  bannerUrn: string
  username: string
  posts: Post[]
  postCount?: string

  // Virtuals
  imageUrl: string
  bannerUrl: string
}
