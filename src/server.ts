import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import trim from "./middlewares/trim";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(trim);

app.get("/", (_, res) => res.send("hi~"));
app.use("/api/auth", authRoutes);

app.listen(3100, async () => {
  console.log("Server running at http://localhost:3100");

  try {
    await createConnection();
    console.log("Datebase connected!");
  } catch (error) {
    console.error(error);
  }
});
