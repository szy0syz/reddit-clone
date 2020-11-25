import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import { validate } from "class-validator";

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    // TODO: Validate data
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = 'Email is already taken';
    if (usernameUser) errors.username = 'Username is already taken';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // TODO: Create the user
    const user = new User({ email, username, password });

    // 在 entity 上定义 class-validate 生成的装饰器，可以喂给自己 “吃”
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json({ errors });

    await user.save();

    // Todo: Return the user
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const router = Router();
router.post("/register", register);

export default router;
