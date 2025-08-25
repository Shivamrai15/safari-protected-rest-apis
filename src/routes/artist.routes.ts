import { Router } from "express";
import {
  getArtistSongs,
  subscribe,
  unsubscribe,
} from "../controllers/artist.controller.js";

export const artistRouter = Router();
artistRouter.get("/:id/songs", getArtistSongs);
artistRouter.get("/:id/subscribe", subscribe);
artistRouter.get("/:id/unsubscribe", unsubscribe);