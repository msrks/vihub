import "server-only";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { protos, v1 as ai } from "@google-cloud/aiplatform";

import { aiOptions, PARENT } from "./env";

import type { ImageStoreType } from "../db/schema";
const { definition } = protos.google.cloud.aiplatform.v1.schema.trainingjob;

const client = new ai.PipelineServiceClient(aiOptions);

export const listTrainingPipelines = async () => {
  const [trainingPipelines, ,] = await client.listTrainingPipelines({
    parent: PARENT,
  });
  const result = trainingPipelines.map((tp) => {
    const _startTime = +(tp.createTime?.seconds?.toString() ?? 0);
    const _endTime = +(tp.endTime?.seconds?.toString() ?? 0);
    return {
      id: tp.name?.split("/").slice(-1)[0],
      startTime: new Date(1000 * _startTime),
      endTime: new Date(1000 * _endTime),
      durationMinutes: Math.round((_endTime - _startTime) / 60),
      datasetId: tp.inputDataConfig?.datasetId,
      modelId: tp.modelToUpload?.name?.split("/").slice(-1)[0],
      state: tp.state,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  return result.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

const trainingTaskDefinitions = {
  clsS: "gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_image_classification_1.0.0.yaml",
  clsM: "gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_image_classification_1.0.0.yaml",
  det: "gs://google-cloud-aiplatform/schema/trainingjob/definition/automl_image_object_detection_1.0.0.yaml",
};

const trainingTaskInputsList = {
  clsS: new definition.AutoMlImageClassificationInputs({
    multiLabel: false,
    modelType:
      definition.AutoMlImageClassificationInputs.ModelType
        .MOBILE_TF_VERSATILE_1,
    budgetMilliNodeHours: 8000,
    disableEarlyStopping: false,
  }),
  clsM: new definition.AutoMlImageClassificationInputs({
    multiLabel: true,
    modelType:
      definition.AutoMlImageClassificationInputs.ModelType
        .MOBILE_TF_VERSATILE_1,
    budgetMilliNodeHours: 15000,
    disableEarlyStopping: false,
  }),
  det: new definition.AutoMlImageObjectDetectionInputs({
    modelType:
      definition.AutoMlImageObjectDetectionInputs.ModelType
        .MOBILE_TF_VERSATILE_1,
    budgetMilliNodeHours: 20000,
    disableEarlyStopping: false,
  }),
};

export const trainAutoML = async ({
  datasetId,
  type,
}: {
  datasetId: string;
  type: ImageStoreType;
}) => {
  await client.createTrainingPipeline({
    parent: PARENT,
    trainingPipeline: {
      displayName: Date.now().toString(),

      trainingTaskDefinition: trainingTaskDefinitions[type],
      trainingTaskInputs: (
        trainingTaskInputsList[type] as unknown as {
          toValue: () => protos.google.protobuf.IValue;
        }
      ).toValue(),
      inputDataConfig: {
        datasetId,
        fractionSplit: {
          trainingFraction: 0.8,
          validationFraction: 0.1,
          testFraction: 0.1,
        },
      },
      modelToUpload: { displayName: Date.now().toString() },
    },
  });
};
