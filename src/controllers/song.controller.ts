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
