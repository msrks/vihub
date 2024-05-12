import "server-only";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { v1 as ai } from "@google-cloud/aiplatform";

import { aiOptions, BUCKET_URL, PARENT } from "./env";

const client = new ai.ModelServiceClient(aiOptions);

export const listModels = async () => {
  const [models, ,] = await client.listModels({
    parent: PARENT,
  });
  const result = models.map((m) => ({
    modelId: m.name?.split("/").slice(-1)[0],
    name: m.name,
    displayName: m.displayName,
    datetime: new Date(1000 * +(m.createTime?.seconds?.toString() ?? 0)),
  }));
  return result;
};

export const getModel = async ({ modelId }: { modelId: string }) => {
  const [model] = await client.getModel({
    name: `${PARENT}/models/${modelId}`,
  });
  return {
    numTrain: model.dataStats?.trainingDataItemsCount,
    numTest: model.dataStats?.testDataItemsCount,
    numValid: model.dataStats?.validationDataItemsCount,
  };
};

export const getModelEvaluation = async ({ modelId }: { modelId: string }) => {
  const [evaluations] = await client.listModelEvaluations({
    parent: `${PARENT}/models/${modelId}`,
  });
  const result = evaluations.map((e) => ({
    name: e.name,
    evalId: e.name?.split("/").slice(-1)[0],
    auPrc: e.metrics?.structValue?.fields?.auPrc?.numberValue,
    logLoss: e.metrics?.structValue?.fields?.logLoss?.numberValue,
    // confidenceMetrics:
    //   e.metrics?.structValue?.fields?.confidenceMetrics?.listValue?.values?.map(
    //     (v) => ({
    //       confidenceThreshold:
    //         v.structValue?.fields?.confidenceThreshold?.numberValue,
    //       maxPredictions: v.structValue?.fields?.maxPredictions?.numberValue,
    //       recall: v.structValue?.fields?.recall?.numberValue,
    //       precision: v.structValue?.fields?.precision?.numberValue,
    //     }),
    //   ),
    confusionMatrix: {
      annotationSpecs:
        e.metrics?.structValue?.fields?.confusionMatrix?.structValue?.fields?.annotationSpecs?.listValue?.values?.map(
          (v) => ({
            id: v.structValue?.fields?.id?.stringValue ?? "",
            displayName: v.structValue?.fields?.displayName?.stringValue ?? "",
          }),
        ) ?? [],
      rows:
        e.metrics?.structValue?.fields?.confusionMatrix?.structValue?.fields?.rows?.listValue?.values?.map(
          (v) => ({
            values: v.listValue?.values?.map((v) => v.numberValue ?? 0) ?? [],
          }),
        ) ?? [],
    },
    datetime: new Date(1000 * +(e.createTime?.seconds?.toString() ?? 0)),
  }))[0];
  return result;
};

export const exportModel = async ({
  format,
  modelId,
}: {
  format: "tflite" | "edgetpu-tflite" | "tf-saved-model" | "core-ml" | "tf-js";
  modelId: string;
}): Promise<string> => {
  const [res] = await client.exportModel({
    name: `${PARENT}/models/${modelId}`,
    outputConfig: {
      artifactDestination: {
        outputUriPrefix: `${BUCKET_URL}/model/`,
      },
      exportFormatId: format,
    },
  });
  await res.promise();
  return (
    res.metadata as unknown as {
      outputInfo: { artifactOutputUri: string };
    }
  ).outputInfo.artifactOutputUri;
};

export const deleteModel = async ({ modelId }: { modelId: string }) => {
  await client.deleteModel({
    name: `${PARENT}/models/${modelId}`,
  });
  // await res.promise();
};
