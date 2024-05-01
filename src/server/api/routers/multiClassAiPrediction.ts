import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { and, eq } from "drizzle-orm";
import { labelClasses, multiClassAiPredictions } from "@/server/db/schema";

export const multiClassAiPredictionRouter = createTRPCRouter({
  getByImageId: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(multiClassAiPredictions)
        .where(
          and(
            eq(multiClassAiPredictions.imageId, input.imageId),
            eq(multiClassAiPredictions.isPositive, true),
          ),
        )
        .innerJoin(
          labelClasses,
          eq(labelClasses.id, multiClassAiPredictions.labelClassId),
        );
    }),
});
