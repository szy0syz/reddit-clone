import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import Sub from "../entities/Sub";
import userMid from "../middlewares/user";
import authMid from "../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title must not be empty" });
  }

  const user = res.locals.user;

  try {
    const subRecord = await Sub.findOneOrFail({ name: sub });

    const post = new Post({ title, body, user, sub: subRecord });
    await post.save();

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getPosts = async (_: Request, res: Response) => {
  try {
    const posts = await Post.find({
      order: { createdAt: "DESC" },
      relations: ["sub", "votes", "comments"],
    });

    if (res.locals.user) {
      posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  try {
    const post = await Post.findOneOrFail(
      { identifier, slug },
      { relations: ["sub"] } // relations: ["sub", 'comments'],
    );

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "Post not found" });
  }
};

const commentOnPost = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const body = req.body.body; // comment.body

  try {
    const post = await Post.findOneOrFail({ identifier, slug });
    const comment = new Comment({
      body,
      user: res.locals.user,
      post,
    });

    await comment.save();

    return res.json(comment);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "Post not found" });
  }
};

const router = Router();

router.get("/:identifier/:slug", userMid, authMid, getPost);
router.get(
  "/:identifier/:slug/comments",
  userMid,
  authMid,
  commentOnPost
);
router.get("/", userMid, getPosts);
router.post("/", userMid, authMid, createPost);

export default router;
