import User from "../entities/User";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import { getRepository } from "typeorm";
import { isEmpty } from "class-validator";
import userMid from "../middlewares/user";
import authMid from "../middlewares/auth";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import { NextFunction, Request, Response, Router } from "express";
import { makeId } from "../utils/helpers";

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = "Name muse not be empty";
    if (isEmpty(title)) errors.title = "Title muse not be empty";

    const sub = await getRepository(Sub)
      .createQueryBuilder("sub")
      .where("lower(sub.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = "Sub exists already";

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    const sub = new Sub({ name, description, title, user });
    await sub.save();

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getSub = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const sub = await Sub.findOneOrFail({ name });
    const posts = await Post.find({
      where: { sub },
      order: { createdAt: "DESC" },
      relations: ["comments", "votes"],
    });

    sub.posts = posts;

    if (res.locals.user) {
      sub.posts.forEach((p) => p.setUserVote(res.locals.user));
    }

    return res.json(sub);
  } catch (error) {
    return res.status(404).json({ error: "Sub not found" });
  }
};

const ownSub = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const sub = await Sub.findOneOrFail({ where: { name: req.params.name } });

    if (sub.username !== user.username) {
      return res.status(403).json({ error: "You dont own this sub" });
    }

    res.locals.sub = sub;

    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images",
    filename: (_, file, callback) => {
      const name = makeId(15);
      callback(null, name + path.extname(file.originalname));
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      callback(null, true);
    } else {
      callback(new Error("Not an image"));
    }
  },
});

const uploadSubImage = async (_: Request, res: Response) => {
  res.json({ success: true });
};

const router = Router();

router.get("/:name", userMid, getSub);
router.post("/", userMid, authMid, createSub);
router.post(
  "/:name/upload",
  userMid,
  authMid,
  ownSub,
  upload.single("file"),
  uploadSubImage
);

export default router;
