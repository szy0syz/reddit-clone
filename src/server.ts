import 'reflect-metadata';
import { createConnection } from 'typeorm';
import express from 'express';
import morgan from 'morgan';
import trim from './middlewares/trim';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import subRoutes from './routes/sub';
import miscRoutes from './routes/misc';
import cors from 'cors';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(trim);
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);

app.get('/', (_, res) => res.send('hi~'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/subs', subRoutes);
app.use('/api/miscRoutes', miscRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);

  try {
    await createConnection();
    console.log('Datebase connected!');
  } catch (error) {
    console.error(error);
  }
});
