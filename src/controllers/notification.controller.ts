import type { Request, Response } from "express";
import { db } from "../lib/db.js";
import type { Notification } from "../../generated/prisma/index.js";

const LIMIT = 20;

export async function getNotifications(req: Request, res: Response) {
    try {
        
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access",
                data: {},
            });
        }

        const { cursor } : { cursor?: string } = req.query;

        let notifications : Notification[] = [];

        if (cursor && typeof cursor !== "string") {
            notifications = await db.notification.findMany({
                where: { userId: user.userId },
                orderBy: { createdAt: "desc" },
                take: LIMIT,
                cursor: { id: cursor },
            });
        } else {
            notifications = await db.notification.findMany({
                where: { userId: user.userId },
                orderBy: { createdAt: "desc" },
                take: LIMIT,
            });
        }

        let nextCursor = null;

        if (notifications.length === LIMIT) {
        nextCursor = notifications[LIMIT - 1]?.id;
        }

        return res.json({
            items: notifications,
            nextCursor,
        });

    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: {}
        })
    }
}

export async function seenNotifications(req: Request, res: Response) {
    try {
        
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access",
                data: {},
            });
        }

        await db.notification.updateMany({
            where : {
                userId: user.userId,
                read : false
            },
            data : {
                read : true
            }
        });

        return res.json({
            success: true,
            message: "All notifications marked as seen",
            data: {}
        });
        
    } catch (error) {
        console.error("PATCH SEEN NOTIFICATIONS ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: {}
        })
    }
}

export async function countUnreadNotifications(req: Request, res: Response) {
    try {
        
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized access",
                data: {},
            });
        }
        const count = await db.notification.count({
            where : {
                userId : user.userId,
                read : false
            }
        });

        return res.json({
            success: true,
            message: "Unread notifications count retrieved successfully",
            data: { notificationCount: count }
        });

    } catch (error) {
        console.error("GET COUNT UNREAD NOTIFICATIONS ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: {}
        });
    }
}