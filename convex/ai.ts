import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildContextualPrompt } from "./aiInstructions";

export const chat = action({
  args: {
    conversationId: v.optional(v.string()),
    message: v.string(),
    niche: v.optional(v.string()),
    avatar: v.optional(v.string()),
    tone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.app.getCurrentUser);

    if (!user) {
      throw new Error("User not authenticated");
    }

    const userId = user._id;

    const currentMonth = new Date().toISOString().slice(0, 7);

    const canGenerate = await ctx.runMutation(api.ai.checkUsageLimit, {
      userId,
      month: currentMonth,
    });

    if (!canGenerate) {
      throw new Error(
        "Monthly usage limit reached. Please upgrade to Pro for unlimited generations."
      );
    }

    const systemPrompt = buildContextualPrompt(
      args.niche,
      args.avatar,
      args.tone
    );

    try {
      const result = await streamText({
        model: openai("gpt-4-turbo"),
        system: systemPrompt,
        prompt: args.message,
      });

      const fullResponse = await result.text;
      const usage = await result.usage;

      await ctx.runMutation(api.ai.recordUsage, {
        userId,
        requestType: "chat",
        tokensUsed: usage?.totalTokens || 0,
        success: true,
        month: currentMonth,
      });

      if (args.conversationId) {
        await ctx.runMutation(api.ai.saveMessages, {
          conversationId: args.conversationId,
          messages: [
            { role: "user", content: args.message },
            { role: "assistant", content: fullResponse },
          ],
        });
      }

      return {
        success: true,
        response: fullResponse,
      };
    } catch (error) {
      await ctx.runMutation(api.ai.recordUsage, {
        userId,
        requestType: "chat",
        tokensUsed: 0,
        success: false,
        month: currentMonth,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

export const checkUsageLimit = mutation({
  args: {
    userId: v.string(),
    month: v.string(),
  },
  handler: async (_ctx, _args) => {
    return true;
  },
});

export const recordUsage = mutation({
  args: {
    userId: v.string(),
    requestType: v.string(),
    tokensUsed: v.number(),
    success: v.boolean(),
    month: v.string(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (_ctx, _args) => {
    return { success: true };
  },
});

export const saveMessages = mutation({
  args: {
    conversationId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
    ),
  },
  handler: async (_ctx, _args) => {
    return { success: true };
  },
});

export const createConversation = mutation({
  args: {
    userId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (_ctx, _args) => {
    const conversationId = crypto.randomUUID();
    return { conversationId };
  },
});

export const getConversations = query({
  args: {
    userId: v.string(),
  },
  handler: async (_ctx, _args) => {
    return [];
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.string(),
  },
  handler: async (_ctx, _args) => {
    return [];
  },
});

export const saveScript = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    content: v.string(),
    type: v.string(),
    category: v.optional(v.string()),
    conversationId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (_ctx, _args) => {
    return { scriptId: crypto.randomUUID() };
  },
});

export const getSavedScripts = query({
  args: {
    userId: v.string(),
    type: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (_ctx, _args) => {
    return [];
  },
});

export const deleteScript = mutation({
  args: {
    scriptId: v.string(),
    userId: v.string(),
  },
  handler: async (_ctx, _args) => {
    return { success: true };
  },
});

export const toggleFavorite = mutation({
  args: {
    scriptId: v.string(),
    userId: v.string(),
    isFavorite: v.boolean(),
  },
  handler: async (_ctx, _args) => {
    return { success: true };
  },
});

export const getUserUsageStats = query({
  args: {
    userId: v.string(),
    month: v.string(),
  },
  handler: async (_ctx, _args) => {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalTokens: 0,
      limitReached: false,
    };
  },
});
