import * as z from "zod";

export const PlaylistSchema = z.object({
    name : z.string().min(1, {message : "Playlist name is required"}),
    private : z.boolean(),
    description : z.string().optional()
});

export const AddBulkSongsSchema = z.object({
    playlistId: z.string().min(1, { message: "Playlist ID is required" }),
    songIds: z.array(z.string()).min(1, { message: "At least one song ID is required" })
});