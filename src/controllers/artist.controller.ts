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

export async function getSubscribedArtists(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const artists = await db.artist.findMany({
      where: {
        followerIds: {
          has: user.userId,
        },
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return res.json({
      status: true,
      message: "Success",
      data: artists,
    });
  } catch (error) {
    console.error("GET USER FOLLOWING ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function getFavoriteArtists(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const favoriteArtists = await db.$runCommandRaw({
      aggregate: "Artist",
      pipeline: [
        {
          $lookup: {
            from: "Song",
            localField: "_id",
            foreignField: "artistIds",
            as: "songs",
          },
        },
        {
          $lookup: {
            from: "View",
            let: { songIds: "$songs._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$songId", "$$songIds"] },
                      { $eq: ["$userId", { $oid: user.userId }] },
                    ],
                  },
                },
              },
            ],
            as: "userViews",
          },
        },
        {
          $addFields: {
            viewCount: { $size: "$userViews" },
          },
        },
        {
          $match: {
            viewCount: { $gt: 0 },
          },
        },
        {
          $sort: { viewCount: -1 },
        },
        {
          $limit: 15,
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
          },
        },
      ],
      cursor: {},
    });

    const cursor = favoriteArtists?.cursor as
      | {
          firstBatch: {
            _id: {
              $oid: string;
            };
            name: string;
            image: string;
          }[];
        }
      | undefined;

    const results =
      cursor?.firstBatch.map((data) => ({
        id: data._id.$oid,
        name: data.name,
        image: data.image,
      })) || [];

    return res.json({
      status: true,
      message: "Success",
      data: results,
    });
  } catch (error) {
    console.error("GET USER FAVORITE ARTISTS ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}
