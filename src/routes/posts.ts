import { Request, Response, Router } from "express";
import Post from "../entities/Post";
import authMiddleware from "../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
  const { title, body, sub } = req.body;
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title must not be empty" });
  }

  const user = res.locals.user;

  try {
    // TODO: find sub

    const post = new Post({ title, body, user, subName: sub });
    await post.save();

    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.post("/", authMiddleware, createPost);

export default router;
