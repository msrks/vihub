import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and, count, gte, isNull, isNotNull } from "drizzle-orm";
import { images } from "@/server/db/schema";
import { del, put } from "@vercel/blob";
import { getVectorByReplicate } from "@/server/replicate";
import { vdb } from "@/server/pinecone";
import { createHash } from "crypto";
import { type PineconeRecord } from "@pinecone-database/pinecone";

export const imageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        file: z.custom<File>(),
        humanLabelId: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, file, humanLabelId } }) => {
      const filename = `${process.env.BLOB_NAME_SPACE!}/${file.name}`;

      // upload to vercel blob
      const blob = await put(filename, file, { access: "public" });
      const { url, downloadUrl } = blob;

      // get vector embedding & store it to pinecone
      const vector = await getVectorByReplicate(url);
      const vectorId = createHash("md5").update(url).digest("hex");
      await vdb(imageStoreId.toString()).upsert([
        {
          id: vectorId,
          metadata: { imagePath: url },
          values: vector,
        } satisfies PineconeRecord,
      ]);

      // save to db
      const ret = await ctx.db
        .insert(images)
        .values({
          url,
          downloadUrl,
          imageStoreId,
          vectorId,
          humanLabelId,
        })
        .returning();
      if (!ret[0]) throw new Error("something went wrong..");
      return { id: ret[0].id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        humanLabelId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id, humanLabelId } }) => {
      const ret = await ctx.db
        .update(images)
        .set({ humanLabelId })
        .where(eq(images.id, id))
        .returning();
      if (!ret[0]) throw new Error("something went wrong..");
      return { success: true };
    }),

  deleteById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const ret = await ctx.db
        .delete(images)
        .where(eq(images.id, id))
        .returning();
      if (!ret[0]) throw new Error("something went wrong..");

      // delete from vercel blob
      await del(ret[0].url);

      // delete from pinecone
      await vdb(ret[0].imageStoreId.toString()).deleteOne(ret[0].vectorId);

      return { success: true };
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
        onlyLabeled: z.boolean().optional(),
        onlyUnlabeled: z.boolean().optional(),
      }),
    )
    .query(
      async ({
        ctx,
        input: {
          imageStoreId,
          limit,
          cursor,
          date,
          onlyLabeled,
          onlyUnlabeled,
        },
      }) => {
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
              onlyLabeled ? isNotNull(images.humanLabelId) : undefined,
              onlyUnlabeled ? isNull(images.humanLabelId) : undefined,
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
      },
    ),
});
