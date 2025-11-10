import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getUserThumbnails, getThumbnailById, getUserMixes, getMixById, createThumbnail, createMix, createAnalysis, getAnalysisByThumbnailId } from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  thumbnails: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserThumbnails(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getThumbnailById(input.id);
      }),
    analyze: protectedProcedure
      .input(z.object({ thumbnailId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const thumbnail = await getThumbnailById(input.thumbnailId);
        if (!thumbnail || thumbnail.userId !== ctx.user.id) {
          throw new Error("Thumbnail not found or unauthorized");
        }

        // Use LLM to analyze the thumbnail
        const analysis = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert YouTube thumbnail designer. Analyze the thumbnail image and provide insights about colors, text, composition, and engagement potential."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this YouTube thumbnail and provide: 1) Dominant colors (hex codes), 2) Text elements and their positions, 3) Overall composition, 4) Engagement score (1-10), 5) Improvement suggestions. Return as JSON."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: thumbnail.fileUrl,
                    detail: "high"
                  }
                }
              ]
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "thumbnail_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  dominantColors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of dominant hex colors"
                  },
                  textElements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        position: { type: "string" }
                      }
                    }
                  },
                  composition: { type: "string" },
                  engagementScore: { type: "number" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["dominantColors", "textElements", "composition", "engagementScore", "suggestions"],
                additionalProperties: false
              }
            }
          }
        });

        const analysisContent = typeof analysis.choices[0].message.content === 'string'
          ? JSON.parse(analysis.choices[0].message.content)
          : analysis.choices[0].message.content;

        await createAnalysis({
          thumbnailId: input.thumbnailId,
          dominantColors: JSON.stringify(analysisContent.dominantColors),
          textElements: JSON.stringify(analysisContent.textElements),
          composition: analysisContent.composition,
          engagementScore: analysisContent.engagementScore,
          suggestions: JSON.stringify(analysisContent.suggestions)
        });

        return analysisContent;
      }),
  }),

  mixes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserMixes(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getMixById(input.id);
      }),
    getSuggestions: protectedProcedure
      .input(z.object({ thumbnailIds: z.array(z.number()) }))
      .mutation(async ({ input, ctx }) => {
        // Get all thumbnails
        const thumbnails = await Promise.all(
          input.thumbnailIds.map(id => getThumbnailById(id))
        );

        // Verify ownership
        for (const thumb of thumbnails) {
          if (!thumb || thumb.userId !== ctx.user.id) {
            throw new Error("One or more thumbnails not found or unauthorized");
          }
        }

        // Get analyses for each thumbnail
        const analyses = await Promise.all(
          input.thumbnailIds.map(id => getAnalysisByThumbnailId(id))
        );

        // Use LLM to generate mixing suggestions
        const suggestions = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert YouTube thumbnail designer specializing in combining elements from multiple thumbnails to create optimal designs."
            },
            {
              role: "user",
              content: `Based on these thumbnail analyses, suggest the best way to mix and combine them:
${JSON.stringify(analyses.map(a => ({
  dominantColors: a?.dominantColors ? JSON.parse(a.dominantColors) : [],
  textElements: a?.textElements ? JSON.parse(a.textElements) : [],
  composition: a?.composition,
  engagementScore: a?.engagementScore
})))}

Provide specific recommendations for:
1. Best color combinations
2. Text placement strategy
3. Overall composition approach
4. Expected engagement improvement`
            }
          ]
        });

        return {
          suggestions: suggestions.choices[0].message.content,
          analysisData: analyses
        };
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        sourceThumbIds: z.array(z.number()),
        blendingMethod: z.string().default("smart")
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createMix({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          sourceThumbIds: JSON.stringify(input.sourceThumbIds),
          blendingMethod: input.blendingMethod
        });
        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
