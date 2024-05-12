export const PROJECT_ID = process.env.GCP_PROJECT_ID!;
export const BUCKET = process.env.GCP_BUCKET!;
export const BUCKET_URL = `gs://${process.env.GCP_BUCKET}`;

export const REGION = "us-central1";
export const PARENT = `projects/${PROJECT_ID}/locations/${REGION}`;
