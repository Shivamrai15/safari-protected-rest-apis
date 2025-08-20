import { Router } from "express";
import { getAlbumSongs } from "../controllers/album.controller.js";

export const albumRouter = Router();
albumRouter.get("/:id/songs", getAlbumSongs);
