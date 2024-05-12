import { api } from "@/trpc/server";

export async function GET() {
  const { numTriggerd } = await api.trainingJob.trainAllOfReady();
  await api.trainingJob.updateModelStatus();
  return Response.json({ numTriggerd });
}
