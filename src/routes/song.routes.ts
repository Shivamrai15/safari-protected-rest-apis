import { Router } from "express";
import { getLyrics } from "../controllers/song.controller.js";

export const songRouter = Router();
songRouter.get("/:id/lyrics", getLyrics);
