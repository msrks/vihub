import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { labelClasses, referenceImages } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { put } from "@vercel/blob";

export const referenceImageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        description: z.string().optional(),
        file: z.custom<File>(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, description, file } }) => {
      try {
        const filename = `${process.env.BLOB_NAME_SPACE!}/${imageStoreId}/refImages/${file.name}`;

        // upload to vercel blob
        const blob = await put(filename, file, { access: "public" });
        const { url, downloadUrl } = blob;

        // save to db
        const ret = await ctx.db
          .insert(referenceImages)
          .values({ imageStoreId, url, downloadUrl, description })
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
        description: z.string().optional(),
        labelClassId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .update(referenceImages)
        .set(input)
        .where(eq(referenceImages.id, input.id));
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(referenceImages)
        .where(eq(referenceImages.imageStoreId, input.imageStoreId))
        .leftJoin(
          labelClasses,
          eq(referenceImages.labelClassId, labelClasses.id),
        )
        .orderBy(desc(referenceImages.updatedAt));
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db
        .delete(referenceImages)
        .where(eq(referenceImages.id, input.id));
    }),
});
