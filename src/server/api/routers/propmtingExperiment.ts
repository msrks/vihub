import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { labelClasses, promptingExperiments } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export const promptingExperimentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        title: z.string(),
        labelClassId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, title, labelClassId } }) => {
      try {
        const ret = await ctx.db
          .insert(promptingExperiments)
          .values({ imageStoreId, title, labelClassId })
          .returning();
        if (!ret[0]) throw new Error("something went wrong..");
        return { id: ret[0].id };
      } catch (error) {
        return { error: "something went wrong.." };
      }
    }),
  // update: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.number(),
  //       color: z.string().optional(),
  //       displayName: z.string().optional(),
  //       specDefinition: z.string().optional(),
  //     }),
  //   )
  //   .mutation(
  //     async ({ ctx, input: { id, color, displayName, specDefinition } }) => {
  //       try {
  //         const ret = await ctx.db
  //           .update(promptingExperiments)
  //           .set({ color, displayName, specDefinition })
  //           .where(eq(promptingExperiments.id, id))
  //           .returning();
  //         if (!ret[0]) throw new Error("something went wrong..");
  //         return { id: ret[0].id };
  //       } catch (error) {
  //         return { error: "something went wrong.." };
  //       }
  //     },
  //   ),

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
        .orderBy(desc(promptingExperiments.updatedAt));
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
        .where(eq(promptingExperiments.id, input.id));
      if (!res[0]) throw new Error("not found");
      return res[0];
    }),
});
