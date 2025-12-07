import express from "express";
import { albumRouter, artistRouter, songRouter } from "./routes/index.js";
import { playlistRouter } from "./routes/playlist.routes.js";
import { userRouter } from "./routes/user.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.get("/api/v2/health", (req, res) => {
  return res.json({
    status: "healthy",
    service: "Catalog & Metadata Server API",
    version: "1.0.0"
  });
});

app.use(authMiddleware)
app.use("/api/v2/album", albumRouter);
app.use("/api/v2/artist", artistRouter);
app.use("/api/v2/song", songRouter);
app.use("/api/v2/playlist", playlistRouter);
app.use("/api/v2/user", userRouter);

app.listen(PORT, () => {
  console.log(`Protected server is running on port ${PORT}`);
});
