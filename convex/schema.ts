import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    title: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    allDay: v.boolean(),
    color: v.string(),
    recurrence: v.union(v.string(), v.null()),
    notes: v.union(v.string(), v.null()),
    userId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_start", ["userId", "startTime"]),
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }).index("by_author", ["author"]),
});

