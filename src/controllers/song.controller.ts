import type { Request, Response } from "express";
import { db } from "../lib/db.js";
import { LYRICS_NOT_FOUND_MESSAGES } from "../lib/constants.js";

export async function getLyrics(req: Request, res: Response) {
  try {
    const songId = req.params.id;

    if (!songId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        data: {},
      });
    }

    const lyrics = await db.lyrics.findUnique({
      where: {
        songId,
      },
    });

    if (!lyrics) {
      return res.status(404).json({
        status: false,
        message:
          LYRICS_NOT_FOUND_MESSAGES[
            Math.floor(Math.random() * LYRICS_NOT_FOUND_MESSAGES.length)
          ],
        data: {},
      });
    }

    return res.json({
      status: true,
      message: "Success",
      data: lyrics,
    });
  } catch (error) {
    console.error("GET LYRICS API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}

export async function getListenAgain(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const mostPicks = await db.history.groupBy({
      by: ["songId"],
      where: {
        userId: user.userId,
      },
      _count: {
        songId: true,
      },
      orderBy: {
        _count: {
          songId: "desc",
        },
      },
      take: 16,
    });

    const mostPicksSongIds = mostPicks.map((song) => song.songId);
    const songs = await db.song.findMany({
      where: {
        id: {
          in: mostPicksSongIds,
        },
      },
      include: {
        artists: {
          select: {
            id: true,
            name: true,
          },
        },
        album: true,
      },
    });

    songs.sort(
      (a, b) => mostPicksSongIds.indexOf(a.id) - mostPicksSongIds.indexOf(b.id)
    );

    return res.json({
      status: true,
      message: "Success",
      data: songs,
    });
  } catch (error) {
    console.error("GET LISTEN AGAIN API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}

export async function setView(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const songId = req.params.id;
    if (!songId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        data: {},
      });
    }

    const view = await db.view.findUnique({
      where: {
        songId_userId: {
          songId,
          userId: user.userId,
        },
      },
    });

    if (!view) {
      await db.view.create({
        data: {
          songId,
          userId: user.userId,
        },
      });
    }

    return res.json({
      success: true,
      message: "Success",
      data: {},
    });
  } catch (error) {
    console.error(" VIEW API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}
