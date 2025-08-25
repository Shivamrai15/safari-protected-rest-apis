import type { Request, Response } from "express";
import { db } from "../lib/db.js";

export async function getUserLikedSongs(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const likedSongs = await db.likedSongs.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        songId: true,
      },
    });
    const likedSongIds = likedSongs.map((song) => song.songId);
    res.status(200).json({
      status: true,
      message: "Success",
      data: likedSongIds,
    });
  } catch (error) {
    console.error("GET LIKED SONGS API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function setUserLikedSong(req: Request, res: Response) {
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
        message: "Song ID is required",
        data: {},
      });
    }

    const song = await db.song.findUnique({
      where: {
        id: songId,
      },
    });

    if (!song) {
      return res.status(404).json({
        status: false,
        message: "Song not found",
        data: {},
      });
    }

    await db.likedSongs.create({
      data: {
        userId: user.userId,
        songId: songId,
      },
    });
    
    return res.status(201).json({
      status: true,
      message: "Success",
      data: {},
    });
  } catch (error) {
    console.error("POST LIKED SONG API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function getUserLikedTracks(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const songs = await db.likedSongs.findMany({
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
    });

    return res.status(200).json({
      status: true,
      message: "Success",
      data: songs,
    });
  } catch (error) {
    console.error("GET LIKED TRACKS API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function removeUserLikedSong(req: Request, res: Response) {
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
        message: "Bad request",
        data: {},
      });
    }

    await db.likedSongs.delete({
      where: {
        songId_userId: {
          userId: user.userId,
          songId: songId,
        },
      },
    });
    
    return res.status(204).json({
      status: true,
      message: "Success",
      data: {},
    });

  } catch (error) {
    console.error("DELETE LIKED SONG API ERROR", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}
