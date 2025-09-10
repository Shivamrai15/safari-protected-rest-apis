import type { Request, Response } from "express";
import { db } from "../lib/db.js";
import { AccountSchema } from "../schemas/account.schema.js";
import type { Subscription } from "../../generated/prisma/index.js";

const BATCH = 10;

export async function getAccountDetails(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const details = await db.user.findUnique({
      where: {
        id: user.userId,
      },
      select: {
        id: true,
        name: true,
        privateSession: true,
        showRecommendations: true,
      },
    });

    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.userId,
      },
      orderBy: {
        stripeCurrentPeriodEnd: "desc",
      },
      select: {
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    const isActive =
      subscription &&
      new Date(subscription.stripeCurrentPeriodEnd) > new Date();

    res.status(200).json({
      status: true,
      message: "Account details retrieved successfully",
      data: {
        ...details,
        subscription : {
          isActive: !!isActive,
          currentPeriodEnd: subscription?.stripeCurrentPeriodEnd || null,
          priceId: subscription?.stripePriceId || null,
        }
      },
    });
  } catch (error) {
    console.error("GET ACCOUNT DETAILS ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function updateAccountSettings(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
        data: {},
      });
    }

    const validatedData = await AccountSchema.safeParseAsync(req.body);
    if (!validatedData.success) {
      return res.status(400).json({
        status: false,
        message: "Invalid account settings",
        data: validatedData.error,
      });
    }

    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.userId,
      },
      orderBy: {
        stripeCurrentPeriodEnd: "desc",
      },
      select: {
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    const isActive =
      subscription &&
      new Date(subscription.stripeCurrentPeriodEnd) > new Date();

    if (!isActive) {
      return res.status(403).json({
        status: false,
        message: "Subscription is not active",
        data: {},
      });
    }

    await db.user.update({
      where: {
        id: user.userId,
      },
      data: {
        ...validatedData.data,
      },
    });

    res.status(200).json({
      status: true,
      message: "Account settings updated successfully",
      data: {
        ...validatedData.data,
        isSubscribed: !!isActive,
      },
    });
  } catch (error) {
    console.error("UPDATE ACCOUNT SETTINGS ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}

export async function getUserOrderHistory(req: Request, res: Response) {
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
    let orders: Subscription[] = [];

    if (cursor) {
      orders = await db.subscription.findMany({
        where: {
          userId: user.userId,
        },
        cursor: {
          id: cursor as string,
        },
        take: BATCH,
        skip: 1,
        orderBy: {
          createdAt: "desc",
        },
        distinct: "stripeCurrentPeriodEnd",
      });
    } else {
      orders = await db.subscription.findMany({
        where: {
          userId: user.userId,
        },
        take: BATCH,
        orderBy: {
          createdAt: "desc",
        },
        distinct: "stripeCurrentPeriodEnd",
      });
    }

    let nextCursor = null;

    if (orders.length === BATCH) {
      nextCursor = orders[BATCH - 1]?.id;
    }

    return res.json({
      items: orders,
      nextCursor,
    });
  } catch (error) {
    console.error("GET ORDER HISTORY ERROR:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: {},
    });
  }
}
