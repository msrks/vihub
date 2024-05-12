import "server-only";

export const PROJECT_ID = process.env.GCP_PROJECT_ID!;
export const BUCKET = process.env.GCP_BUCKET!;
export const BUCKET_URL = `gs://${process.env.GCP_BUCKET}`;

export const REGION = "us-central1";
export const PARENT = `projects/${PROJECT_ID}/locations/${REGION}`;

export const aiOptions = {
  apiEndpoint: "us-central1-aiplatform.googleapis.com",
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY,
  },
  projectId: process.env.GCP_PROJECT_ID,
};
