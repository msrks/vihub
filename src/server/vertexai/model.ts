/* eslint-disable @typescript-eslint/no-explicit-any */
import { v1 as ai } from "@google-cloud/aiplatform";
import { BUCKET_URL, PARENT } from "./env";

const client = new ai.ModelServiceClient({
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
});

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

export const getModel = async ({ name }: { name: string }) => {
  const [model] = await client.getModel({
    name,
  });
  console.log(JSON.stringify(model, null, 2));
};

export const listModelEvaluation = async ({ modelId }: { modelId: string }) => {
  const [evaluations] = await client.listModelEvaluations({
    parent: `${PARENT}/models/${modelId}`,
  });
  const result = evaluations.map((e) => ({
    name: e.name,
    id: e.name?.split("/").slice(-1)[0],
    auPrc: e.metrics?.structValue?.fields?.auPrc?.numberValue,
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
