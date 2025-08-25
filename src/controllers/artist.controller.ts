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

export async function subscribe(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const artistId = req.params.id;
    if (!artistId) {
      return res
        .status(400)
        .json({ status: false, message: "Bad Request", data: {} });
    }

    await db.user.update({
      where: {
        id: user.userId,
      },
      data: {
        following: {
          connect: {
            id: artistId,
          },
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Subscribed to artist",
      data: {},
    });
  } catch (error) {
    console.error("GET SUBSCRIBE ARTIST API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}

export async function unsubscribe(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const artistId = req.params.id;
    if (!artistId) {
      return res
        .status(400)
        .json({ status: false, message: "Bad Request", data: {} });
    }

    await db.user.update({
      where: {
        id: user.userId,
      },
      data: {
        following: {
          disconnect: {
            id: artistId,
          },
        },
      },
    });

    return res.status(200).json({
      status: true,
      message: "Unsubscribed to artist",
      data: {},
    });
  } catch (error) {
    console.error("GET UNSUBSCRIBE ARTIST API ERROR", error);
    return res.json({
      status: false,
      message: "Internal Server Error",
      data: {},
    });
  }
}
