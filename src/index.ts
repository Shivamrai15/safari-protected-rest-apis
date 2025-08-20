import express from "express";
import { albumRouter, artistRouter, songRouter } from "./routes/index.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

app.get("/api/v2/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.use("/api/v2/album", albumRouter);
app.use("/api/v2/artist", artistRouter);
app.use("/api/v2/song", songRouter);

app.listen(PORT, () => {
  console.log(`Protected server is running on port ${PORT}`);
});
