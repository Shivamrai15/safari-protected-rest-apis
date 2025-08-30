import { Router } from "express";
import {
  getArtistSongs,
  subscribe,
  unsubscribe,
} from "../controllers/artist.controller.js";
import { cache } from "../middlewares/cache.middleware.js";

export const artistRouter = Router();
artistRouter.get("/:id/songs", cache, getArtistSongs);
artistRouter.get("/:id/subscribe", subscribe);
artistRouter.get("/:id/unsubscribe", unsubscribe);