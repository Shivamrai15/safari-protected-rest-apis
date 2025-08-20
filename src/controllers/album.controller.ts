import type { Request, Response } from "express";
import { db } from "../lib/db.js";

export async function getAlbumSongs(req: Request, res: Response) {
  try {
    const albumId = req.params.id;
    if (!albumId) {
      return res
        .status(400)
        .json({ status: false, message: "Bad Request", data: {} });
    }

    const songs = await db.song.findMany({
      where: {
        albumId: albumId,
      },
      include: {
        album: true,
      },
    });

    return res
      .status(200)
      .json({ status: true, message: "Success", data: songs });
  } catch (error) {
    console.error("GET ALBUM SONGS API ERROR", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", data: {} });
  }
}
