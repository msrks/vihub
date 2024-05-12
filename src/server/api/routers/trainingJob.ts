import { and, eq, isNotNull, notInArray } from "drizzle-orm";
import * as fs from "fs";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { images, labelClasses, trainingJobs } from "@/server/db/schema";
import { getGCPCredentials } from "@/server/gcs";
import { createDatasetImage, importDataImage } from "@/server/vertexai/dataset";
import { exportModel, listModelEvaluation } from "@/server/vertexai/model";
import {
  listTrainingPipelines,
  trainAutoMLImageClassification,
} from "@/server/vertexai/pipeline";
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

  trainAllOfReady: protectedProcedure.mutation(async ({ ctx }) => {
    // https://cloud.google.com/vertex-ai/docs/reference/rest/v1/PipelineState
    const jobs = await ctx.db
      .select()
      .from(trainingJobs)
      .where(
        and(
          isNotNull(trainingJobs.datasetId),
          notInArray(trainingJobs.state, [
            "started",
            "PIPELINE_STATE_QUEUED",
            "PIPELINE_STATE_PENDING",
            "PIPELINE_STATE_RUNNING",
            "PIPELINE_STATE_SUCCEEDED",
          ]),
        ),
      );
    await Promise.all(
      jobs.map(async (job) => {
        await trainAutoMLImageClassification({ datasetId: job.datasetId }),
          await ctx.db
            .update(trainingJobs)
            .set({ state: "started" })
            .where(eq(trainingJobs.id, job.id));
      }),
    );
    return { numTriggerd: jobs.length };
  }),

  updateModelStatus: protectedProcedure.mutation(async ({ ctx }) => {
    const pipelines = await listTrainingPipelines();
    const uniqueDatasetIds = [...new Set(pipelines.map((p) => p.datasetId!))];

    await Promise.all(
      uniqueDatasetIds.map(async (dId) => {
        const p = pipelines.find((p) => p.datasetId === dId);
        if (!p?.state) return;

        const jobs = await ctx.db
          .select()
          .from(trainingJobs)
          .where(eq(trainingJobs.datasetId, dId));
        if (!jobs[0]) return;

        // already exist in pipeline
        if (jobs[0].datasetId === p.modelId && jobs[0].state === p.state) {
          return;
        }

        await ctx.db
          .update(trainingJobs)
          .set({ modelId: p.modelId, state: p.state as string })
          .where(eq(trainingJobs.datasetId, dId));

        if (p.modelId && p.state === "PIPELINE_STATE_SUCCEEDED") {
          const modelEval = await listModelEvaluation({ modelId: p.modelId });
          const urlTFlite = await exportModel({
            format: "tflite",
            modelId: p.modelId,
          });
          const urlSavedModel = await exportModel({
            format: "tf-saved-model",
            modelId: p.modelId,
          });
          const urlTFJS = await exportModel({
            format: "tf-js",
            modelId: p.modelId,
          });
          await ctx.db
            .update(trainingJobs)
            .set({
              auPrc: modelEval?.auPrc,
              evalId: modelEval?.id,
              urlTFlite,
              urlSavedModel,
              urlTFJS,
            })
            .where(eq(trainingJobs.datasetId, dId));
          // TODO: send notification email to workspace members
        }
      }),
    );
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

      const datasetId = await createDatasetImage({
        displayName: timestamp.toString(),
      });
      await importDataImage({ datasetId, gcsSourceUri });

      return await ctx.db.insert(trainingJobs).values({
        type: "clsS",
        state: "preparing",
        numImages: dataset.length,
        datasetId,
        importFilePath: gcsSourceUri,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageStoreId,
      });
    }),
});
