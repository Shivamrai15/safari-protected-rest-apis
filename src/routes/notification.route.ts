import { Router } from "express";
import { countUnreadNotifications, getNotifications, seenNotifications } from "../controllers/notification.controller.js";

export const notificationRouter = Router();

notificationRouter.get("/", getNotifications);
notificationRouter.get("/unread", countUnreadNotifications);
notificationRouter.patch("/seen", seenNotifications);
