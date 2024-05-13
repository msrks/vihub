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

// https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/46861fea8fc2335892dd8c37aaabaab6c40ce062/ai-platform/snippets/get-model-evaluation-image-object-detection.js
//
// console.log('Get model evaluation image object detection response');
// console.log(`\tName : ${response.name}`);
// console.log(`\tMetrics schema uri : ${response.metricsSchemaUri}`);
// console.log(`\tCreate time : ${JSON.stringify(response.createTime)}`);
// console.log(`\tSlice dimensions : ${response.sliceDimensions}`);
//
// const modelExplanation = response.modelExplanation;
// console.log('\tModel explanation');
// if (modelExplanation === null) {
//   console.log('\t\t{}');
// } else {
//   const meanAttributions = modelExplanation.meanAttributions;
//   if (meanAttributions === null) {
//     console.log('\t\t\t []');
//   } else {
//     for (const meanAttribution of meanAttributions) {
//       console.log('\t\tMean attribution');
//       console.log(
//         `\t\t\tBaseline output value : \
//           ${meanAttribution.baselineOutputValue}`
//       );
//       console.log(
//         `\t\t\tInstance output value : \
//           ${meanAttribution.instanceOutputValue}`
//       );
//       console.log(
//         `\t\t\tFeature attributions : \
//           ${meanAttribution.featureAttributions}`
//       );
//       console.log(`\t\t\tOutput index : ${meanAttribution.outputIndex}`);
//       console.log(
//         `\t\t\tOutput display name : \
//           ${meanAttribution.outputDisplayName}`
//       );
//       console.log(
//         `\t\t\tApproximation error : \
//           ${meanAttribution.approximationError}`
//       );
//     }
//   }
// }

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
    evaluatedBoundingBoxCount:
      e.metrics?.structValue?.fields?.evaluatedBoundingBoxCount?.numberValue,
    boundingBoxMetrics:
      e.metrics?.structValue?.fields?.boundingBoxMetrics?.listValue?.values?.map(
        (v) => ({
          iouThreshold: v.structValue?.fields?.iouThreshold?.numberValue,
          meanAveragePrecision:
            v.structValue?.fields?.meanAveragePrecision?.numberValue,
          // confidenceMetrics:
          //   v.structValue?.fields?.confidenceMetrics?.listValue?.values?.map(
          //     (v) => ({
          //       confidenceThreshold:
          //         v.structValue?.fields?.confidenceThreshold?.numberValue,
          //       recall: v.structValue?.fields?.recall?.numberValue,
          //       precision: v.structValue?.fields?.precision?.numberValue,
          //       f1Score: v.structValue?.fields?.f1Score?.numberValue,
          //     }),
          //   ),
        }),
      ),
    mAPbbox:
      e.metrics?.structValue?.fields?.boundingBoxMeanAveragePrecision
        ?.numberValue,
    datetime: new Date(1000 * +(e.createTime?.seconds?.toString() ?? 0)),
  }))[0];
  // console.log(result);
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
