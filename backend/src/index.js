import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/userRoute.js";
import eventRoute from "./routes/eventRoute.js";
import mongoose from "mongoose";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json("Hello World");
});

mongoose
  .connect(process.env.DB, {})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/event", eventRoute);

app.use(errorHandler);
export default app;
