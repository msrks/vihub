import { and, asc, count, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  images,
  imageStoreTypeList,
  labelClasses,
  labelsClsM,
  labelsDet,
  multiClassAiPredictions,
} from "@/server/db/schema";

export const labelClassRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        key: z.string(),
        displayName: z.string(),
        type: z.enum(imageStoreTypeList),
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
        .orderBy(asc(labelClasses.type), asc(labelClasses.key));
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(labelClasses).where(eq(labelClasses.id, input.id));
    }),

  // getAllWithCount: protectedProcedure
  //   .input(
  //     z.object({
  //       imageStoreId: z.number(),
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const humanLabels = ctx.db
  //       .select({
  //         labelId: images.humanLabelId,
  //         countH: count(images.id).as("countH"),
  //       })
  //       .from(images)
  //       .where(eq(images.imageStoreId, input.imageStoreId))
  //       .groupBy(images.humanLabelId)
  //       .as("humanLabels");

  //     const aiLabels = ctx.db
  //       .select({
  //         labelId: images.aiLabelId,
  //         countA: count(images.id).as("countA"),
  //       })
  //       .from(images)
  //       .where(eq(images.imageStoreId, input.imageStoreId))
  //       .groupBy(images.aiLabelId)
  //       .as("aiLabels");

  //     return await ctx.db
  //       .select({
  //         labelClasses,
  //         humanCount: humanLabels.countH,
  //         aiCount: aiLabels.countA,
  //       })
  //       .from(labelClasses)
  //       .where(eq(labelClasses.imageStoreId, input.imageStoreId))
  //       .orderBy(labelClasses.key)
  //       .leftJoin(humanLabels, eq(humanLabels.labelId, labelClasses.id))
  //       .leftJoin(aiLabels, eq(aiLabels.labelId, labelClasses.id));
  //   }),

  getHumanCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(images)
        .where(eq(images.humanLabelId, input.id))
        .groupBy(images.humanLabelId);
      return res[0]?.count ?? 0;
    }),

  getAICount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(images)
        .where(eq(images.aiLabelId, input.id))
        .groupBy(images.aiLabelId);
      return res[0]?.count ?? 0;
    }),

  getMultiHumanCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(labelsClsM)
        .where(eq(labelsClsM.labelClassId, input.id))
        .groupBy(labelsClsM.labelClassId);
      return res[0]?.count ?? 0;
    }),

  getMultiAiCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(multiClassAiPredictions)
        .where(
          and(
            eq(multiClassAiPredictions.labelClassId, input.id),
            eq(multiClassAiPredictions.isPositive, true),
          ),
        )
        .groupBy(multiClassAiPredictions.labelClassId);
      return res[0]?.count ?? 0;
    }),

  getDetHumanCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(labelsDet)
        .where(
          and(
            eq(labelsDet.labelClassId, input.id),
            eq(labelsDet.type, "human"),
          ),
        )
        .groupBy(labelsDet.labelClassId);
      return res[0]?.count ?? 0;
    }),

  getDetAiCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db
        .select({ count: count() })
        .from(labelsDet)
        .where(
          and(eq(labelsDet.labelClassId, input.id), eq(labelsDet.type, "ai")),
        )
        .groupBy(labelsDet.labelClassId);
      return res[0]?.count ?? 0;
    }),
});
