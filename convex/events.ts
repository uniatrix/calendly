import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getEventsForMonth = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Calculate start and end of month
    const startDate = new Date(args.year, args.month - 1, 1);
    const endDate = new Date(args.year, args.month, 0, 23, 59, 59, 999);

    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    return await ctx.db
      .query("events")
      .withIndex("by_user_start", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), startTime),
          q.lte(q.field("startTime"), endTime)
        )
      )
      .collect();
  },
});

export const getEventsForWeek = query({
  args: {
    startDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Calculate end of week (7 days later)
    const endTime = args.startDate + 7 * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("events")
      .withIndex("by_user_start", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), args.startDate),
          q.lt(q.field("startTime"), endTime)
        )
      )
      .collect();
  },
});

export const getEventsForDay = query({
  args: {
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Calculate start and end of day
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTime = startOfDay.getTime();
    const endTime = endOfDay.getTime();

    return await ctx.db
      .query("events")
      .withIndex("by_user_start", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("startTime"), startTime),
          q.lte(q.field("startTime"), endTime)
        )
      )
      .collect();
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    allDay: v.boolean(),
    color: v.string(),
    recurrence: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const eventId = await ctx.db.insert("events", {
      ...args,
      userId,
    });

    return await ctx.db.get("events", eventId);
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    color: v.optional(v.string()),
    recurrence: v.optional(v.union(v.string(), v.null())),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;

    // Verify ownership
    const event = await ctx.db.get(id);
    if (!event) {
      throw new Error("Event not found");
    }

    const userId = identity.subject;
    if (event.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(id, updates);
    return await ctx.db.get(id);
  },
});

export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    const userId = identity.subject;
    if (event.userId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.id);
  },
});

