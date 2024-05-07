import { createHash } from "crypto";
import {
  and,
  count,
  desc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  images,
  imagesToMultiLabelClasss as i2ml,
  labelClasses as lc,
} from "@/server/db/schema";
import { vdb } from "@/server/pinecone";
import { getVectorByReplicate } from "@/server/replicate";
import { del, put } from "@vercel/blob";

import type { PineconeRecord } from "@pinecone-database/pinecone";

export const imageRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        file: z.custom<File | Buffer>(),
        humanLabelId: z.number().optional(),
        aiLabelKey: z.string().optional(),
        aiLabelDetail: z
          .object({
            confidence: z.number(),
          })
          .optional(),
        createdAt: z.date().optional(),
        createdAtDate: z.string().optional(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          imageStoreId,
          file,
          humanLabelId,
          aiLabelKey,
          aiLabelDetail,
          createdAt,
          createdAtDate,
        },
      }) => {
        // get aiLabelId if aiLabelKey is provided
        let aiLabelId: number | undefined;
        if (aiLabelKey) {
          const _res = await ctx.db
            .select()
            .from(lc)
            .where(
              and(eq(lc.key, aiLabelKey), eq(lc.imageStoreId, imageStoreId)),
            );
          if (!_res[0]) throw new Error("aiLabelKey not found..");
          aiLabelId = _res[0].id;
        }

        // upload to vercel blob
        const filename = `${process.env.BLOB_NAME_SPACE!}/${imageStoreId}/images/${Date.now()}`;
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
            aiLabelId,
            aiLabelDetail,
            createdAt,
            createdAtDate,
          })
          .returning();
        if (!ret[0]) throw new Error("something went wrong..");
        return { id: ret[0].id };
      },
    ),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        humanLabelId: z.number().optional(),
        multiLabelIds: z.array(z.number()).optional(),
        selectedForExperiment: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { id, multiLabelIds, ...rest } }) => {
      await ctx.db
        .update(images)
        .set(rest)
        .where(eq(images.id, id))
        .returning();
      if (multiLabelIds) await ctx.db.delete(i2ml).where(eq(i2ml.imageId, id));
      if (multiLabelIds?.length) {
        await ctx.db.insert(i2ml).values(
          multiLabelIds.map((labelClassId) => ({
            imageId: id,
            labelClassId,
          })),
        );
      }

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

  getByImagePath: protectedProcedure
    .input(
      z.object({
        imagePath: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ret = await ctx.db
        .select()
        .from(images)
        .where(eq(images.url, input.imagePath));

      if (!ret[0]) throw new Error("something went wrong..");
      return ret[0];
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

  getDataset: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, from, to } }) => {
      const labels = await ctx.db
        .select({ id: lc.id, key: lc.key })
        .from(lc)
        .where(
          and(eq(lc.imageStoreId, imageStoreId), eq(lc.isMultiClass, false)),
        );

      return await Promise.all(
        labels.map(async ({ key, id }) => {
          const imgs = await ctx.db
            .select({ id: images.id, url: images.downloadUrl })
            .from(images)
            .where(
              and(
                eq(images.imageStoreId, imageStoreId),
                eq(images.humanLabelId, id),
                from ? gte(images.createdAt, from) : undefined,
                to ? lte(images.createdAt, to) : undefined,
              ),
            );
          return { key, imgs };
        }),
      );
    }),

  getDatasetMultiLabel: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, from, to } }) => {
      const labels = await ctx.db
        .select({ key: lc.key })
        .from(lc)
        .where(
          and(
            eq(lc.imageStoreId, imageStoreId),
            eq(lc.isMultiClass, true),
            from ? gte(images.createdAt, from) : undefined,
            to ? lte(images.createdAt, to) : undefined,
          ),
        );

      const imgs = await ctx.db
        .select({
          id: images.id,
          url: images.downloadUrl,
          labelKeys: sql<string[]>`array_agg(${lc.key})`,
        })
        .from(images)
        .where(and(eq(images.imageStoreId, imageStoreId)))
        .innerJoin(i2ml, eq(i2ml.imageId, images.id))
        .innerJoin(lc, eq(lc.id, i2ml.labelClassId))
        .groupBy(images.id);
      return { keys: labels.map((l) => l.key), imgs };
    }),

  getMultiClassDataset: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId } }) => {
      const labels = await ctx.db
        .select({ id: lc.id, key: lc.key })
        .from(lc)
        .where(
          and(eq(lc.imageStoreId, imageStoreId), eq(lc.isMultiClass, true)),
        );

      return await Promise.all(
        labels.map(async ({ key, id }) => {
          const imgs = await ctx.db
            .select({ id: images.id, url: images.downloadUrl })
            .from(images)
            .where(
              and(
                eq(images.imageStoreId, imageStoreId),
                eq(images.humanLabelId, id),
              ),
            );
          return { key, imgs };
        }),
      );
    }),

  getAllCountsByStoreId: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        onlyLabeled: z.boolean().optional(),
        onlyUnlabeled: z.boolean().optional(),
      }),
    )
    .query(
      async ({ ctx, input: { imageStoreId, onlyLabeled, onlyUnlabeled } }) => {
        return await ctx.db
          .select({ date: images.createdAtDate, count: count() })
          .from(images)
          .where(
            and(
              eq(images.imageStoreId, imageStoreId),
              onlyLabeled ? isNotNull(images.humanLabelId) : undefined,
              onlyUnlabeled ? isNull(images.humanLabelId) : undefined,
            ),
          )
          .groupBy(images.createdAtDate)
          .orderBy(images.createdAtDate);
      },
    ),

  getAllCountsPerLabelPerDate: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const allLabels = await ctx.db
        .select()
        .from(lc)
        .where(eq(lc.imageStoreId, input.imageStoreId));

      return await ctx.db
        .select({
          date: images.createdAtDate,
          count: count(),
          ...allLabels.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.key]:
                sql`count(*) filter (where ${images.aiLabelId} = ${curr.id})`.mapWith(
                  Number,
                ),
            }),
            {},
          ),
        })
        .from(images)
        .where(eq(images.imageStoreId, input.imageStoreId))
        .groupBy(images.createdAtDate)
        .orderBy(images.createdAtDate);
    }),

  getTestImages: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(images)
        .where(
          and(
            eq(images.imageStoreId, input.imageStoreId),
            eq(images.selectedForExperiment, true),
          ),
        );
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
          .orderBy(desc(images.createdAt))
          .limit(limit + 1)
          .where(
            and(
              eq(images.imageStoreId, imageStoreId),
              lte(images.createdAt, cursor ?? new Date()),
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

  getMultiLabels: protectedProcedure
    .input(
      z.object({
        imageId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { imageId } }) => {
      return await ctx.db
        .select({
          id: lc.id,
          key: lc.key,
          color: lc.color,
          displayName: lc.displayName,
        })
        .from(i2ml)
        .where(eq(i2ml.imageId, imageId))
        .innerJoin(lc, eq(lc.id, i2ml.labelClassId));
    }),
});
