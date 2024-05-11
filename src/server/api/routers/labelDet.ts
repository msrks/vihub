import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { labelsDet } from "@/server/db/schema";

export const labelDetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["ai", "human"]),
        imageId: z.number(),
        labelClassId: z.number(),
        xMin: z.number(),
        yMin: z.number(),
        xMax: z.number(),
        yMax: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      const ret = await ctx.db.insert(labelsDet).values(input).returning();
      if (!ret[0]) throw new Error("something went wrong..");
      return;
    }),

  getAllByImageId: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(labelsDet)
        .where(eq(labelsDet.imageId, input.imageId));
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(labelsDet).where(eq(labelsDet.id, input.id));
      return;
    }),
});
