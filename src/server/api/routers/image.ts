import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and, count, gte } from "drizzle-orm";
import { images } from "@/server/db/schema";

export const imageRouter = createTRPCRouter({
  // create: protectedProcedure
  //   .input(
  //     z.object({
  //       name: z.string().min(1),
  //       workspaceId: z.number(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     try {
  //       const ret = await ctx.db
  //         .insert(images)
  //         .values({
  //           name: input.name,
  //           workspaceId: input.workspaceId,
  //         })
  //         .returning();

  //       if (!ret[0]) throw new Error("something went wrong..");

  //       return { id: ret[0].id };
  //     } catch (error) {
  //       return { error: "something went wrong.." };
  //     }
  //   }),

  getAll: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(images)
        .where(eq(images.imageStoreId, input.imageStoreId));
    }),

  getAllCountsByStoreId: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({ date: images.createdAtDate, count: count() })
        .from(images)
        .where(eq(images.imageStoreId, input.imageStoreId))
        .groupBy(images.createdAtDate)
        .orderBy(images.createdAtDate);
    }),
  getInfiniteByImageStoreId: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        limit: z.number().min(1),
        cursor: z.date().nullish(),
        date: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input: { imageStoreId, limit, cursor, date } }) => {
      const items = await ctx.db
        .select()
        .from(images)
        .orderBy(images.createdAt)
        .limit(limit + 1)
        .where(
          and(
            eq(images.imageStoreId, imageStoreId),
            gte(images.createdAt, cursor ?? new Date(0)),
            date ? eq(images.createdAtDate, date) : undefined,
          ),
        );

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.createdAt;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
