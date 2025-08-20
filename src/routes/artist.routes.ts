import { Router } from "express";
import { getArtistSongs } from "../controllers/artist.controller.js";

export const artistRouter = Router();
artistRouter.get("/:id/songs", getArtistSongs);