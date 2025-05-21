import express from "express";
import User from "../models/userSchema.js";
import AsyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import successHandler from "../middleware/successMiddleWare.js";

const router = express.Router();

// Register route
router.post(
  "/register",
  AsyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400);
      throw new Error("Email already exists");
    }

    const user = await User.create({ name, email, password });

    if (user) {
      res.status(201).json(
        successHandler({
          user_id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id), // Make sure generateToken.js exports default
          createdAt: user.createdAt,
        })
      );
    } else {
      throw new Error("Create user failed");
    }
  })
);

// Login route
router.post(
  "/login",
  AsyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json(
        successHandler({
          user_id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        })
      );
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  })
);

export default router;
