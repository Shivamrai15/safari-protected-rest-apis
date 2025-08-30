import { Router } from "express";
import { getAlbumSongs } from "../controllers/album.controller.js";
import { cache } from "../middlewares/cache.middleware.js";

export const albumRouter = Router();
albumRouter.get("/:id/songs", cache, getAlbumSongs);
