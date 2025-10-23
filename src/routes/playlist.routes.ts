import { Router } from "express";
import {
  addPlaylistSong,
  createPlaylist,
  deleteUserPlaylist,
  getPlaylistSongs,
  getUserPlaylist,
  getUserPlaylists,
  removePlaylistSong,
  restorePlaylist,
  updateUserPlaylist,
  getPlaylistExistingSongs
} from "../controllers/playlist.controller.js";

export const playlistRouter = Router();

playlistRouter.post("/", createPlaylist);
playlistRouter.get("/", getUserPlaylists);
playlistRouter.get("/:id/songs", getPlaylistSongs);
playlistRouter.get("/:id/existing-songs", getPlaylistExistingSongs);
playlistRouter.patch("/:id/restore", restorePlaylist);
playlistRouter.delete("/:id/songs/:songId", removePlaylistSong);
playlistRouter.post("/:id/songs/:songId", addPlaylistSong);
playlistRouter.get("/:id", getUserPlaylist);
playlistRouter.patch("/:id", updateUserPlaylist);
playlistRouter.delete("/:id", deleteUserPlaylist);