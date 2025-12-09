import express from "express";
import { albumRouter, artistRouter, songRouter } from "./routes/index.js";
import { playlistRouter } from "./routes/playlist.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import { connectDB, disconnectDB } from "./lib/db.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.get("/api/v2/health", (req, res) => {
  return res.json({
    status: "healthy",
    service: "User Management Server API",
    version: "1.0.0"
  });
});

app.use(authMiddleware)
app.use("/api/v2/album", albumRouter);
app.use("/api/v2/artist", artistRouter);
app.use("/api/v2/song", songRouter);
app.use("/api/v2/playlist", playlistRouter);
app.use("/api/v2/user", userRouter);

async function startServer() {
    await connectDB();
    
    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    const shutdown = async (signal: string) => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await disconnectDB();
            console.log("Server closed");
            process.exit(0);
        });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

export default app;
