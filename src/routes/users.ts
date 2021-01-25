import { Response, Request, Router } from "express";
import Post from "../entities/Post";
import User from "../entities/User";
import Comment from "../entities/Comment";

import userMid from "../middlewares/user";

const getUserSubmission = async (req: Request, res: Response) => {
  try {
    const user = await User.findOneOrFail({
      where: { username: req.params.username },
      select: ["username", "createdAt"],
    });

    const posts = await Post.find({
      where: { user },
      relations: ["post"],
    });

    const comments = await Comment.find({
      where: { user },
      relations: ["post"],
    });

    if (res.locals.user) {
      const { user } = res.locals;
      posts.forEach((p) => p.setUserVote(user));
      comments.forEach((c) => c.setUserVote(user));
    }

    let submissions: any[] = [];

    posts.forEach((p) => submissions.push({ type: "Post", ...p.toJSON() }));
    comments.forEach((c) =>
      submissions.push({ type: "Comment", ...c.toJSON() })
    );

    submissions.sort((a, b) => {
      if (b.createdAt > a.createdAt) return 1;
      if (b.createdAt < a.createdAt) return -1;
      return 0;
    });

    return res.json({ user, submissions });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.get("/:username", userMid, getUserSubmission);
