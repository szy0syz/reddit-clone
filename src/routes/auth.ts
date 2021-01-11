import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import User from '../entities/User';
import { validate, isEmpty } from 'class-validator';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import dotenv from 'dotenv';
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';

dotenv.config();

const mapErrors = (errors: Object[]) => {
  return errors.reduce((prev: any, err: any) => {
    prev[err.property] = Object.entries(err.constraints)[0][1]
    return prev
  }, {})
}

const register = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  try {
    let errors: any = {};
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    if (emailUser) errors.email = '邮箱地址已被注册';
    if (usernameUser) errors.username = '该用户名已被注册';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = new User({ email, username, password });

    // 在 entity 上定义 class-validate 生成的装饰器，可以喂给自己 “吃”
    errors = await validate(user);
    if (errors.length > 0) return res.status(400).json(mapErrors(errors));

    await user.save();

    // Todo: Return the user
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
};

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    let errors: any = {};

    if (isEmpty(username)) errors.username = '用户名不能为空';
    if (isEmpty(password)) errors.password = '密码不能为空';
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ username: '用户名没有注册' });

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ password: '密码不正确' });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET!);

    res.set(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600,
        path: '/',
      })
    );

    return res.json({ user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const logout = async (_: Request, res: Response) => {
  res.set(
    'Set-Cookie',
    cookie.serialize('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    })
  );

  res.status(200).json({ success: true });
};

const me = async (_: Request, res: Response) => {
  return res.json(res.locals.user);
};

const router = Router();
router.get('/me', userMiddleware, authMiddleware, me);
router.post('/login', login);
router.post('/logout', userMiddleware, authMiddleware, logout);
router.post('/register', register);

export default router;
