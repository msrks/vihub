import { and, eq, isNotNull, notInArray, sql } from "drizzle-orm";
import { promises } from "fs";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  images as I,
  imageStoreTypeList,
  labelClasses as lc,
  labelsClsM,
  labelsDet,
  trainingJobs,
} from "@/server/db/schema";
import { getGCPCredentials } from "@/server/gcs";
import { createDataset, importDataset } from "@/server/vertexai/dataset";
import {
  exportModel,
  getModel,
  getModelEvaluation,
} from "@/server/vertexai/model";
import { listTrainingPipelines, trainAutoML } from "@/server/vertexai/pipeline";
import { Storage } from "@google-cloud/storage";

const clip0to1 = (v: number) => Math.min(1, Math.max(0, v));

const zOptionalNumber = z.coerce
  .number()
  .optional()
  .nullish()
  .transform((v) => v ?? undefined);

const modelSchema = z.object({
  numTrain: zOptionalNumber,
  numTest: zOptionalNumber,
  numValid: zOptionalNumber,
});

export const trainingJobRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ imagesStoreId: z.number() }))
    .query(async ({ ctx, input: { imagesStoreId } }) => {
      return await ctx.db
        .select()
        .from(trainingJobs)
        .where(eq(trainingJobs.imageStoreId, imagesStoreId));
    }),

  trainAllOfReady: publicProcedure.mutation(async ({ ctx }) => {
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
        await trainAutoML({ datasetId: job.datasetId, type: job.type }),
          await ctx.db
            .update(trainingJobs)
            .set({ state: "started" })
            .where(eq(trainingJobs.id, job.id));
      }),
    );
    return { numTriggerd: jobs.length };
  }),

  updateModelStatus: publicProcedure.mutation(async ({ ctx }) => {
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
          const model = modelSchema.parse(
            await getModel({ modelId: p.modelId }),
          );

          const result = await getModelEvaluation({ modelId: p.modelId });
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
              auPrc: result?.auPrc ?? result?.mAPbbox,
              evalId: result?.evalId,
              logLoss: result?.logLoss,
              confusionMatrix: result?.confusionMatrix,
              urlTFlite,
              urlSavedModel,
              urlTFJS,
              ...model,
              durationMinutes: p.durationMinutes,
              updatedAt: p.endTime,
            })
            .where(eq(trainingJobs.datasetId, dId));
          // TODO: send notification email to workspace members
        }
      }),
    );
  }),

  prepareDataset: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        type: z.enum(imageStoreTypeList),
      }),
    )
    .mutation(async ({ ctx, input: { imageStoreId, type } }) => {
      let csvString = "";
      let numImages = 0;
      const displayName = Date.now().toString();
      const fileName = `${displayName}.csv`;
      const destination = `_jobs/${fileName}`;
      const gcsSourceUri = `gs://vihub/${destination}`;

      const uploadImportFile = async (csvString: string) => {
        await promises.writeFile(`/tmp/${fileName}`, csvString, "utf-8");
        const storage = new Storage(getGCPCredentials());
        await storage
          .bucket("vihub")
          .upload(`/tmp/${fileName}`, { destination });
      };

      const datasetId = await createDataset({ displayName });

      if (type === "clsS") {
        const dataset = await ctx.db
          .select({ url: I.gsutilURI, label: lc.key })
          .from(I)
          .where(
            and(
              eq(I.imageStoreId, imageStoreId),
              eq(I.isLabeled, true),
              isNotNull(I.humanLabelId),
            ),
          )
          .innerJoin(lc, eq(I.humanLabelId, lc.id));
        numImages = dataset.length;
        csvString = dataset.map((d) => `${d.url},${d.label}`).join("\n");
      } else if (type === "clsM") {
        const dataset = await ctx.db
          .select({
            id: I.id,
            url: I.gsutilURI,
            labelKeys: sql<string[]>`array_agg(${lc.key})`,
          })
          .from(I)
          .where(and(eq(I.imageStoreId, imageStoreId), eq(I.isLabeled, true)))
          .leftJoin(labelsClsM, eq(labelsClsM.imageId, I.id))
          .leftJoin(lc, eq(lc.id, labelsClsM.labelClassId))
          .groupBy(I.id);
        numImages = dataset.length;
        csvString = dataset
          .map((d) =>
            d.labelKeys.length > 0
              ? `${d.url},${d.labelKeys.join(",")}`
              : d.url,
          )
          .join("\n");
      } else if (type === "det") {
        const dataset = await ctx.db
          .select({
            url: I.gsutilURI,
            label: lc.key,
            xMin: labelsDet.xMin,
            yMin: labelsDet.yMin,
            xMax: labelsDet.xMax,
            yMax: labelsDet.yMax,
            width: I.width,
            height: I.height,
          })
          .from(I)
          .where(and(eq(I.imageStoreId, imageStoreId), eq(I.isLabeled, true)))
          .leftJoin(
            labelsDet,
            and(eq(labelsDet.imageId, I.id), eq(labelsDet.type, "human")),
          )
          .leftJoin(lc, eq(labelsDet.labelClassId, lc.id));
        numImages = dataset.length;
        csvString = dataset
          .map((d) => {
            // https://cloud.google.com/vertex-ai/docs/image-data/object-detection/prepare-data?hl=ja#csv
            if (!d.label || !d.xMin || !d.yMin || !d.xMax || !d.yMax) {
              return d.url;
            }
            const xMin = clip0to1(d.xMin / d.width);
            const yMin = clip0to1(d.yMin / d.height);
            const xMax = clip0to1(d.xMax / d.width);
            const yMax = clip0to1(d.yMax / d.height);
            return `${d.url},${d.label},${xMin},${yMin},,,${xMax},${yMax},,`;
          })
          .join("\n");
      }

      await uploadImportFile(csvString);
      await importDataset({ datasetId, gcsSourceUri, type });

      return await ctx.db.insert(trainingJobs).values({
        type,
        state: "preparing",
        numImages,
        datasetId,
        importFilePath: gcsSourceUri,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageStoreId,
      });
    }),
});
