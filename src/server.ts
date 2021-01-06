import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import trim from "./middlewares/trim";
import cookieParser from 'cookie-parser';
import authRoutes from "./routes/auth";
import postRoutes from './routes/posts';

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());

app.get("/", (_, res) => res.send("hi~"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);

  try {
    await createConnection();
    console.log("Datebase connected!");
  } catch (error) {
    console.error(error);
  }
});
