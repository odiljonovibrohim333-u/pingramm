import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all videos for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("videos")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Get a single video by ID
export const get = query({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.videoId);
  },
});

// Create a new video project
export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    return await ctx.db.insert("videos", {
      userId: identity.subject,
      title: args.title,
      prompt: args.prompt,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update video status (e.g., when generation starts/completes)
export const updateStatus = mutation({
  args: {
    videoId: v.id("videos"),
    status: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    videoUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.number()),
    resolution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video || video.userId !== identity.subject) {
      throw new Error("Video not found or unauthorized");
    }

    await ctx.db.patch(args.videoId, {
      status: args.status,
      videoUrl: args.videoUrl,
      thumbnailUrl: args.thumbnailUrl,
      duration: args.duration,
      resolution: args.resolution,
      updatedAt: Date.now(),
    });
  },
});

// Delete a video
export const remove = mutation({
  args: { videoId: v.id("videos") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const video = await ctx.db.get(args.videoId);
    if (!video || video.userId !== identity.subject) {
      throw new Error("Video not found or unauthorized");
    }

    await ctx.db.delete(args.videoId);
  },
});
