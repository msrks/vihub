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
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, key, displayName } }) => {
      try {
        const ret = await ctx.db
          .insert(labelClasses)
          .values({ imageStoreId, key, displayName })
          .returning();
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
      return ctx.db
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
      return ctx.db
        .select({ labelClasses, count: count(images.id) })
        .from(labelClasses)
        .where(eq(labelClasses.imageStoreId, input.imageStoreId))
        .leftJoin(images, eq(images.humanLabelId, labelClasses.id))
        .groupBy(labelClasses.id)
        .orderBy(labelClasses.key);
    }),
});
