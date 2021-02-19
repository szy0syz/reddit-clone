import User from "../entities/User";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import { getRepository } from "typeorm";
import { isEmpty } from "class-validator";
import userMid from "../middlewares/user";
import authMid from "../middlewares/auth";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
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
      callback(null, name + path.extname(file.originalname)); // e.g. jh34gh2v4y + .png
    },
  }),
  fileFilter: (_, file: any, callback: FileFilterCallback) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      callback(new Error("Not an image"));
    }
  },
});

const uploadSubImage = async (req: Request, res: Response) => {
  const sub: Sub = res.locals.sub;
  try {
    const type = req.body.type;

    // 如果用户上传了图片，但没指名type则删除文件
    // 完全没必要后判断，可以提前判断就不必要传文件了
    if (type !== "image" && type !== "banner") {
      if (!req.file?.path) {
        return res.status(400).json({ error: "Invalid file" });
      }

      // 竟然会自动加 dirname / pwd
      // 因为是通过 multer 封装的 file 对象是带文件路径的
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Invalid type" });
    }

    let oldImageUrn: string = "";

    if (type === "image") {
      // 新的urn即将来临，提前存好老的urn
      oldImageUrn = sub.imageUrn || "";
      // 覆盖老的urn
      sub.imageUrn = req.file.filename;
    } else if (type === "banner") {
      // banner 和 image 不同
      oldImageUrn = sub.bannerUrn || "";
      sub.bannerUrn = req.file.filename;
    }
    await sub.save();

    // 删除原来没用的图片文件
    if (oldImageUrn !== "") {
      // 因为数据库存的只是 filename，得自己加上对象路径前缀
      // 兼容 Linux 和 Windows
      const fullFilaName = path.resolve(
        process.cwd(),
        "public",
        "images",
        oldImageUrn
      );

      fs.unlinkSync(fullFilaName);
    }

    return res.json(sub);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const searchSubs = async (req: Request, res: Response) => {
  try {
    const name = req.params.name;

    if (isEmpty(name)) {
      return res.status(404).json({ error: "Name must not be empty" });
    }

    // reactjs, ReactJS
    const subs = await getRepository(Sub)
      .createQueryBuilder()
      // react => rea
      .where("LOWER(name) LIKE :name", {
        name: `${name.toLowerCase().trim()}%`,
      })
      .getMany();

    return res.json(subs);
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const router = Router();

router.get("/:name", userMid, getSub);
router.get("/search/:name", searchSubs);
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
