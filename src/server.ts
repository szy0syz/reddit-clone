import "reflect-metadata";

import cors from "cors";
import morgan from "morgan";
import express from "express";
import trim from "./middlewares/trim";
import cookieParser from "cookie-parser";
import { createConnection } from "typeorm";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import subRoutes from "./routes/sub";
import miscRoutes from "./routes/misc";
import userRoutes from "./routes/users";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
  })
);

app.use(express.static('public'))

app.get("/", (_, res) => res.send("running"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/misc", miscRoutes);
app.use("/api/users", userRoutes);

app.listen(process.env.PORT, async () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);

  try {
    await createConnection();
    console.log("Datebase connected!");
  } catch (error) {
    console.error(error);
  }
});
