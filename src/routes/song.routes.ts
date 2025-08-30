import { Router } from "express";
import {
  getListenAgain,
  getLyrics,
  setView,
} from "../controllers/song.controller.js";
import {
  getUserLikedSongs,
  getUserLikedTracks,
  removeUserLikedSong,
  setUserLikedSong,
} from "../controllers/liked.controller.js";
import { cache } from "../middlewares/cache.middleware.js";

export const songRouter = Router();

songRouter.get("/listen-again", getListenAgain);
songRouter.get("/liked", getUserLikedSongs);
songRouter.post("/liked", setUserLikedSong);
songRouter.get("/liked/tracks", getUserLikedTracks);
songRouter.delete("/liked/:id", removeUserLikedSong);
songRouter.get("/:id/lyrics", cache, getLyrics);
songRouter.get("/:id/view", setView);
