import { and, eq, isNotNull } from "drizzle-orm";
import * as fs from "fs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { images, labelClasses, trainingJobs } from "@/server/db/schema";
import { getGCPCredentials } from "@/server/gcs";
import { createDatasetImage, importDataImage } from "@/server/vertexai/dataset";
import { Storage } from "@google-cloud/storage";

export const trainingJobRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        imagesStoreId: z.number(),
      }),
    )
    .query(async ({ ctx, input: { imagesStoreId } }) => {
      return await ctx.db
        .select()
        .from(trainingJobs)
        .where(eq(trainingJobs.imageStoreId, imagesStoreId));
    }),

  prepareDatasetClsS: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId } }) => {
      const dataset = await ctx.db
        .select({
          url: images.gsutilURI,
          label: labelClasses.key,
        })
        .from(images)
        .where(
          and(
            eq(images.imageStoreId, imageStoreId),
            isNotNull(images.humanLabelId),
          ),
        )
        .innerJoin(labelClasses, eq(images.humanLabelId, labelClasses.id));
      const timestamp = Date.now();
      const fileName = `${timestamp}.csv`;
      const data = dataset.map((d) => `${d.url},${d.label}`).join("\n");
      await fs.promises.writeFile(`/tmp/${fileName}`, data, "utf-8");

      const destination = `_jobs/${fileName}`;
      const storage = new Storage(getGCPCredentials());
      await storage.bucket("vihub").upload(`/tmp/${fileName}`, { destination });

      const gcsSourceUri = `gs://vihub/${destination}`;

      console.log(gcsSourceUri);

      const datasetId = await createDatasetImage({
        displayName: timestamp.toString(),
      });
      await importDataImage({ datasetId, gcsSourceUri });

      return await ctx.db.insert(trainingJobs).values({
        type: "clsS",
        status: "preparing",
        numImages: dataset.length,
        vertexAiDatasetId: datasetId,
        gcsDatasetFilePath: gcsSourceUri,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageStoreId,
      });
    }),
});
