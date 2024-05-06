import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { images, labelClasses } from "@/server/db/schema";
import { count, eq } from "drizzle-orm";

export const labelClassRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        key: z.string(),
        displayName: z.string(),
        isMultiClass: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const ret = await ctx.db.insert(labelClasses).values(input).returning();
        if (!ret[0]) throw new Error("something went wrong..");
        return { id: ret[0].id };
      } catch (error) {
        return { error: "something went wrong.." };
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        color: z.string().optional(),
        displayName: z.string().optional(),
        specDefinition: z.string().optional(),
      }),
    )
    .mutation(
      async ({ ctx, input: { id, color, displayName, specDefinition } }) => {
        try {
          const ret = await ctx.db
            .update(labelClasses)
            .set({ color, displayName, specDefinition })
            .where(eq(labelClasses.id, id))
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
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(labelClasses)
        .where(eq(labelClasses.imageStoreId, input.imageStoreId))
        .orderBy(labelClasses.key);
    }),

  getAllWithCount: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const humanLabels = ctx.db
        .select({
          labelId: images.humanLabelId,
          countH: count(images.id).as("countH"),
        })
        .from(images)
        .where(eq(images.imageStoreId, input.imageStoreId))
        .groupBy(images.humanLabelId)
        .as("humanLabels");

      const aiLabels = ctx.db
        .select({
          labelId: images.aiLabelId,
          countA: count(images.id).as("countA"),
        })
        .from(images)
        .where(eq(images.imageStoreId, input.imageStoreId))
        .groupBy(images.aiLabelId)
        .as("aiLabels");

      return await ctx.db
        .select({
          labelClasses,
          humanCount: humanLabels.countH,
          aiCount: aiLabels.countA,
        })
        .from(labelClasses)
        .where(eq(labelClasses.imageStoreId, input.imageStoreId))
        .orderBy(labelClasses.key)
        .leftJoin(humanLabels, eq(humanLabels.labelId, labelClasses.id))
        .leftJoin(aiLabels, eq(aiLabels.labelId, labelClasses.id));
    }),
});
