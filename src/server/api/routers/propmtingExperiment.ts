import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { labelClasses, promptingExperiments } from "@/server/db/schema";

export const promptingExperimentRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        imagesStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(promptingExperiments)
        .where(eq(promptingExperiments.imageStoreId, input.imagesStoreId))
        .innerJoin(
          labelClasses,
          eq(labelClasses.id, promptingExperiments.labelClassId),
        )
        .orderBy(desc(promptingExperiments.createdAt));
    }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select()
        .from(promptingExperiments)
        .where(eq(promptingExperiments.id, input.id))
        .innerJoin(
          labelClasses,
          eq(labelClasses.id, promptingExperiments.labelClassId),
        );
      if (!res[0]) throw new Error("not found");
      return res[0];
    }),
});
