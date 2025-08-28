import type { Request, Response } from "express";
import { db } from "../lib/db.js";
import type { Album, History, Song } from "../../generated/prisma/index.js";

const BATCH = 10;

export const setUserHistory = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const { songId }: { songId: string } = req.body;
    if (!songId) {
      return res.status(400).json({
        status: false,
        message: "Bad Request",
        data: {},
      });
    }

    const history = await db.history.create({
      data: {
        userId: user.userId,
        songId: songId,
      },
    });

    return res.status(201).json({
      status: true,
      message: "Success",
      data: history,
    });
  } catch (error) {
    console.error("POST HISTORY API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
};

export async function getUserHistory(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const { cursor } = req.query;

    let history: (History & {
      song: Song & {
        album: Album;
        artists: { id: string; name: string; image: string }[];
      };
    })[] = [];

    if (cursor) {
      history = await db.history.findMany({
        where: {
          userId: user.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          song: {
            include: {
              album: true,
              artists: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        take: BATCH,
        skip: 1,
        cursor: {
          id: cursor as string,
        },
      });
    } else {
      history = await db.history.findMany({
        where: {
          userId: user.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          song: {
            include: {
              album: true,
              artists: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        take: BATCH,
      });
    }

    let nextCursor = null;

    if (history.length === BATCH) {
      nextCursor = history[BATCH - 1]?.id;
    }

    return res.status(200).json({
      items: history,
      nextCursor,
    });
  } catch (error) {
    console.error("GET HISTORY API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function deleteHistory(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    await db.history.deleteMany({
      where: {
        userId: user.userId,
      },
    });

    return res.status(200).json({
      status: true,
      message: "History cleared successfully",
      data: {},
    });
  } catch (error) {
    console.error("DELETE HISTORY API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}
