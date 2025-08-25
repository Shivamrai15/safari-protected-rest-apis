import { Router } from "express";
import {
  getUserHistory,
  setUserHistory,
} from "../controllers/history.controller.js";

export const userRouter = Router();

userRouter.get("/history", getUserHistory);
userRouter.post("/history", setUserHistory);
