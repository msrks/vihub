import "server-only";

import { v1 as ai } from "@google-cloud/aiplatform";

import { aiOptions, PARENT, PROJECT_ID, REGION } from "./env";

import type { ImageStoreType } from "../db/schema";

const client = new ai.DatasetServiceClient(aiOptions);

export const createDataset = async ({
  displayName,
}: {
  displayName: string;
}): Promise<string> => {
  const [res] = await client.createDataset({
    parent: PARENT,
    dataset: {
      displayName,
      metadataSchemaUri:
        "gs://google-cloud-aiplatform/schema/dataset/metadata/image_1.0.0.yaml",
    },
  });
  // Wait for operation to complete
  await res.promise();
  const result = res.result as { name: string };
  const datasetId = result.name.split("/").slice(-1)[0]!;
  return datasetId;
};

const importSchemaUris = {
  clsS: "gs://google-cloud-aiplatform/schema/dataset/ioformat/image_classification_single_label_io_format_1.0.0.yaml",
  clsM: "gs://google-cloud-aiplatform/schema/dataset/ioformat/image_classification_multi_label_io_format_1.0.0.yaml",
  det: "gs://google-cloud-aiplatform/schema/dataset/ioformat/image_bounding_box_io_format_1.0.0.yaml",
};

export const importDataset = async ({
  datasetId,
  gcsSourceUri,
  type,
}: {
  datasetId: string;
  gcsSourceUri: string;
  type: ImageStoreType;
}) => {
  const [response] = await client.importData({
    name: client.datasetPath(PROJECT_ID, REGION, datasetId),
    importConfigs: [
      {
        gcsSource: { uris: [gcsSourceUri] },
        importSchemaUri: importSchemaUris[type],
      },
    ],
  });
  console.log(`Long running operation: ${response.name}`);
};

export const deleteDataset = async ({ datasetId }: { datasetId: string }) => {
  await client.deleteDataset({
    name: client.datasetPath(PROJECT_ID, REGION, datasetId),
  });
};
