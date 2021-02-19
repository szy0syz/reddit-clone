import jwt from "jsonwebtoken";
import User from "../entities/User";
import { NextFunction, Response, Request } from "express";

// * 只提取用户信息，不做任何强制性检查措施
// * 没有就没有，我交控制器出去就完了
export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) return next();

    const { username }: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await User.findOne({ username });

    // * 因为 findOne 可能为 undefined，
    // * 所以 res.locals.user 的类型为 User | undefined
    res.locals.user = user;

    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: "Something went wrong" });
  }
};
