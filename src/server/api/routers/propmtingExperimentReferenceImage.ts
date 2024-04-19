import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { promptingExperimentReferenceImages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const promptingExperimentReferenceImageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        promptingExperimentId: z.number(),
        url: z.string(),
        downloadUrl: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { promptingExperimentId, url, downloadUrl, description },
      }) => {
        try {
          const ret = await ctx.db
            .insert(promptingExperimentReferenceImages)
            .values({ promptingExperimentId, url, downloadUrl, description })
            .returning();
          if (!ret[0]) throw new Error("something went wrong..");
          return { id: ret[0].id };
        } catch (error) {
          return { error: "something went wrong.." };
        }
      },
    ),

  getAll: protectedProcedure
    .input(
      z.object({
        promptingExperimentId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(promptingExperimentReferenceImages)
        .where(
          eq(
            promptingExperimentReferenceImages.promptingExperimentId,
            input.promptingExperimentId,
          ),
        )
        .orderBy(desc(promptingExperimentReferenceImages.updatedAt));
    }),
});
