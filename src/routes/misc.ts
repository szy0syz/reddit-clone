import { Request, Response, Router } from "express";
import User from "../entities/User";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";

const vote = async (req: Request, res: Response) => {
  const { identifier, slug, commentIdentifier, value } = req.body;

  // Validate vote value
  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ value: "Value must be -1, 0 or 1" });
  }

  try {
    const user: User = res.locals.user;
    let post: Post | undefined = await Post.findOneOrFail({ identifier, slug });
    let vote: Vote | undefined;
    let comment: Comment | undefined;

    if (commentIdentifier) {
      // if there is a comment identifier find vote by comment
      comment = await Comment.findOneOrFail({ identifier: commentIdentifier });
      vote = await Vote.findOne({ user, comment });
    } else {
      // else find vote by post
      vote = await Vote.findOne({ user, post });
    }

    if (!vote && value === 0) {
      // if no vote and value = 0 return error
      return res.status(404).json({ error: "Vote not found" });
    } else if (!vote) {
      vote = new Vote({ user, value });
      // vote链接的：要么是帖子，要么是评论
      if (comment) vote.comment = comment;
      else vote.post = post;
      await vote.save();
    } else if (value === 0) {
      // if vote exists and value = 0 remove vote from db
      await vote.remove();
    } else if (vote.value !== value) {
      // if vote and value has changed, update vote
      vote.value = value;
      await vote.save();
    }

    post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["comments", "comments.votes", "sub", "votes"] }
    );

    // ! 帖子有一万条 comment 就有点老火了
    post.setUserVote(user);
    post.comments.forEach((c) => c.setUserVote(user));

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/vote", userMiddleware, authMiddleware, vote);

export default router;
