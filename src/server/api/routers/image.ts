import { createHash } from "crypto";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import sizeOf from "image-size";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  images as I,
  labelClasses as lc,
  labelsClsM,
  labelsDet as lDet,
} from "@/server/db/schema";
import { uploadToGCS } from "@/server/gcs";
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
        width: z.number().optional(),
        height: z.number().optional(),
        isLabeled: z.boolean().optional(),
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
          isLabeled,
        },
      }) => {
        // get size of image
        let buffer: Buffer;

        if (file instanceof Buffer) {
          buffer = file;
        } else {
          const res = await fetch(URL.createObjectURL(file));
          buffer = Buffer.from(await res.arrayBuffer());
        }

        const { width, height } = sizeOf(buffer);

        // get aiLabelId if aiLabelKey is provided
        let aiLabelId: number | undefined;
        if (aiLabelKey) {
          console.info({ aiLabelKey });
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
        const filename = `${process.env.BLOB_NAME_SPACE!}/${imageStoreId}/I/${Date.now()}`;
        const blob = await put(filename, file, { access: "public" });
        const { url, downloadUrl } = blob;

        // upload to gcs
        // const gcsPath = `${imageStoreId}/${Date.now()}.png`;
        const gcsPath = `${imageStoreId}/${Date.now()}.json`;
        const gsutilURI = `gs://vihub/${gcsPath}`;
        try {
          await uploadToGCS(buffer, gcsPath);
        } catch (error) {
          console.error(error);
          throw new Error("failed to upload image to blob..");
        }

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
          .insert(I)
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
            width,
            height,
            gsutilURI,
            isLabeled,
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
      if (Object.keys(rest).length > 0) {
        await ctx.db.update(I).set(rest).where(eq(I.id, id)).returning();
      }
      if (multiLabelIds)
        await ctx.db.delete(labelsClsM).where(eq(labelsClsM.imageId, id));
      if (multiLabelIds?.length) {
        await ctx.db.insert(labelsClsM).values(
          multiLabelIds.map((labelClassId) => ({
            imageId: id,
            labelClassId,
          })),
        );
      }

      return { success: true };
    }),

  toggleIsLabeled: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input: { id } }) => {
      await ctx.db
        .update(I)
        .set({ isLabeled: sql`not ${I.isLabeled}` })
        .where(eq(I.id, id))
        .returning();
      return { success: true };
    }),

  deleteById: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const ret = await ctx.db.delete(I).where(eq(I.id, id)).returning();
      if (!ret[0]) throw new Error("something went wrong..");

      // delete from vercel blob
      await del(ret[0].url);

      // delete from pinecone
      await vdb(ret[0].imageStoreId.toString()).deleteOne(ret[0].vectorId);

      return { success: true };
    }),

  getByImagePath: protectedProcedure
    .input(z.object({ imagePath: z.string() }))
    .query(async ({ ctx, input }) => {
      const ret = await ctx.db
        .select()
        .from(I)
        .where(eq(I.url, input.imagePath));
      if (!ret[0]) throw new Error("something went wrong..");
      return ret[0];
    }),

  getAll: protectedProcedure
    .input(z.object({ imageStoreId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(I)
        .where(eq(I.imageStoreId, input.imageStoreId));
    }),

  getDatasetClsS: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { storeId, from, to } }) => {
      const labels = await ctx.db
        .select({ id: lc.id, key: lc.key })
        .from(lc)
        .where(and(eq(lc.imageStoreId, storeId), eq(lc.type, "clsS")));

      return await Promise.all(
        labels.map(async ({ key, id }) => {
          const imgs = await ctx.db
            .select({ id: I.id, url: I.downloadUrl })
            .from(I)
            .where(
              and(
                eq(I.imageStoreId, storeId),
                eq(I.humanLabelId, id),
                eq(I.isLabeled, true),
                from ? gte(I.createdAt, from) : undefined,
                to ? lte(I.createdAt, to) : undefined,
              ),
            );
          return { key, imgs };
        }),
      );
    }),

  getDatasetClsM: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { storeId, from, to } }) => {
      const labels = await ctx.db
        .select({ key: lc.key })
        .from(lc)
        .where(and(eq(lc.imageStoreId, storeId), eq(lc.type, "clsM")));

      const imgs = await ctx.db
        .select({
          id: I.id,
          url: I.downloadUrl,
          labelKeys: sql<string[]>`array_agg(${lc.key})`,
        })
        .from(I)
        .where(
          and(
            eq(I.imageStoreId, storeId),
            eq(I.isLabeled, true),
            from ? gte(I.createdAt, from) : undefined,
            to ? lte(I.createdAt, to) : undefined,
          ),
        )
        .leftJoin(labelsClsM, eq(labelsClsM.imageId, I.id))
        .leftJoin(lc, eq(lc.id, labelsClsM.labelClassId))
        .groupBy(I.id);
      return { keys: labels.map((l) => l.key), imgs };
    }),

  getDatasetDet: protectedProcedure
    .input(
      z.object({
        storeId: z.number(),
        from: z.date().optional(),
        to: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input: { storeId, from, to } }) => {
      return await ctx.db
        .select({
          id: I.id,
          url: I.downloadUrl,
          width: I.width,
          height: I.height,
          label: lc.key,
          xMin: lDet.xMin,
          yMin: lDet.yMin,
          xMax: lDet.xMax,
          yMax: lDet.yMax,
        })
        .from(I)
        .where(
          and(
            eq(I.imageStoreId, storeId),
            eq(I.isLabeled, true),
            from ? gte(I.createdAt, from) : undefined,
            to ? lte(I.createdAt, to) : undefined,
          ),
        )
        .leftJoin(lDet, and(eq(lDet.imageId, I.id), eq(lDet.type, "human")))
        .leftJoin(lc, eq(lc.id, lDet.labelClassId));
    }),

  // TODO: check is dupulicate??
  getMultiClassDataset: protectedProcedure
    .input(z.object({ imageStoreId: z.number() }))
    .mutation(async ({ ctx, input: { imageStoreId } }) => {
      const labels = await ctx.db
        .select({ id: lc.id, key: lc.key })
        .from(lc)
        .where(and(eq(lc.imageStoreId, imageStoreId), eq(lc.type, "clsM")));

      return await Promise.all(
        labels.map(async ({ key, id }) => {
          const imgs = await ctx.db
            .select({ id: I.id, url: I.downloadUrl })
            .from(I)
            .where(
              and(eq(I.imageStoreId, imageStoreId), eq(I.humanLabelId, id)),
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
          .select({ date: I.createdAtDate, count: count() })
          .from(I)
          .where(
            and(
              eq(I.imageStoreId, imageStoreId),
              onlyLabeled ? eq(I.isLabeled, true) : undefined,
              onlyUnlabeled ? eq(I.isLabeled, false) : undefined,
            ),
          )
          .groupBy(I.createdAtDate)
          .orderBy(I.createdAtDate);
      },
    ),

  getAllCountsPerLabelPerDate: protectedProcedure
    .input(z.object({ imageStoreId: z.number() }))
    .query(async ({ ctx, input }) => {
      const allLabels = await ctx.db
        .select()
        .from(lc)
        .where(eq(lc.imageStoreId, input.imageStoreId));

      return await ctx.db
        .select({
          date: I.createdAtDate,
          count: count(),
          ...allLabels.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.key]:
                sql`count(*) filter (where ${I.aiLabelId} = ${curr.id})`.mapWith(
                  Number,
                ),
            }),
            {},
          ),
        })
        .from(I)
        .where(eq(I.imageStoreId, input.imageStoreId))
        .groupBy(I.createdAtDate)
        .orderBy(I.createdAtDate);
    }),

  getTestImages: protectedProcedure
    .input(z.object({ imageStoreId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(I)
        .where(
          and(
            eq(I.imageStoreId, input.imageStoreId),
            eq(I.selectedForExperiment, true),
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
          .from(I)
          .orderBy(desc(I.createdAt))
          .limit(limit + 1)
          .where(
            and(
              eq(I.imageStoreId, imageStoreId),
              lte(I.createdAt, cursor ?? new Date()),
              date ? eq(I.createdAtDate, date) : undefined,
              onlyLabeled ? eq(I.isLabeled, true) : undefined,
              onlyUnlabeled ? eq(I.isLabeled, false) : undefined,
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
    .input(z.object({ imageId: z.number() }))
    .query(async ({ ctx, input: { imageId } }) => {
      return await ctx.db
        .select({
          id: lc.id,
          key: lc.key,
          color: lc.color,
          displayName: lc.displayName,
        })
        .from(labelsClsM)
        .where(eq(labelsClsM.imageId, imageId))
        .innerJoin(lc, eq(lc.id, labelsClsM.labelClassId));
    }),
});
