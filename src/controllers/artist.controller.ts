import type { Request, Response } from "express";
import { db } from "../lib/db.js";

export async function getArtistSongs(req: Request, res: Response) {
  try {
    const artistId = req.params.id;
    if (!artistId) {
      return res
        .status(400)
        .json({ status: false, message: "Bad Request", data: {} });
    }

    const songs = await db.song.findMany({
      where: {
        artistIds: {
          has: artistId,
        },
      },
      include: {
        album: true,
      },
      orderBy: {
        view: {
          _count: "desc",
        },
      },
      take: 20,
    });

    return res
      .status(200)
      .json({ status: true, message: "Success", data: songs });
  } catch (error) {
    console.error("GET ARTIST SONGS API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}
