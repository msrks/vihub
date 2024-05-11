import { Storage } from "@google-cloud/storage";

const getGCPCredentials = () => {
  return process.env.GOOGLE_PRIVATE_KEY
    ? {
        credentials: {
          client_email: process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY,
        },
        projectId: process.env.GCP_PROJECT_ID,
      }
    : {};
};

export async function uploadJsonToGCS(destination: string): Promise<void> {
  const storage = new Storage(getGCPCredentials());
  const bucket = storage.bucket("vihub");
  await bucket.file(destination).save(
    JSON.stringify({
      foo: "bar",
    }),
    {
      contentType: "application/json",
    },
  );
}
export async function uploadToGCS(
  buffer: Buffer,
  destination: string,
): Promise<void> {
  const storage = new Storage(getGCPCredentials());
  await storage.bucket("vihub").file(destination).save(buffer, {
    contentType: "image/png",
  });
}
