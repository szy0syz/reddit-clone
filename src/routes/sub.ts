import { isEmpty } from 'class-validator';
import { Request, Response, Router } from 'express';
import User from '../entities/User';
import { getRepository } from 'typeorm';
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';
import Sub from '../entities/Sub';

const createSub = async (req: Request, res: Response) => {
  const { name, title, description } = req.body;

  const user: User = res.locals.user;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = 'Name muse not be empty';
    if (isEmpty(title)) errors.title = 'Title muse not be empty';

    const sub = await getRepository(Sub)
      .createQueryBuilder('sub')
      .where('lower(sub.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (sub) errors.name = 'Sub exists already';

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
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const router = Router();

router.post('/', userMiddleware, authMiddleware, createSub);

export default router;
