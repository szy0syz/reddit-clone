import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import morgan from "morgan";
import authRoutes from './routes/auth';

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.send("hi~"));
app.use('/api/auth', authRoutes);

app.listen(6000, async () => {
  console.log("Server running at http://localhost:6000");

  try {
    await createConnection();
    console.log("Datebase connected!");
  } catch (error) {
    console.error(error);
  }
});
