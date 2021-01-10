import User from "../entities/User";
import { NextFunction, Response, Request } from "express";

// * 为了特定 getPosts，业务，拆分中间件
export default async (_: Request, res: Response, next: NextFunction) => {
  try {
    const user: User | undefined = res.locals.user;

    if (!user) throw new Error("Unauthenticated");

    return next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
