import { Router } from "express";
import {
  getArtistSongs,
  getFavoriteArtists,
  getSubscribedArtists,
  subscribe,
  unsubscribe,
} from "../controllers/artist.controller.js";
import { cache } from "../middlewares/cache.middleware.js";

export const artistRouter = Router();
artistRouter.get("/followings", getSubscribedArtists);
artistRouter.get("/favorites", getFavoriteArtists);
artistRouter.get("/:id/songs", cache, getArtistSongs);
artistRouter.get("/:id/subscribe", subscribe);
artistRouter.get("/:id/unsubscribe", unsubscribe);