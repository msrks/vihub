import { api } from "@/trpc/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const { numTriggerd } = await api.trainingJob.trainAllOfReady();
  await api.trainingJob.updateModelStatus();
  return Response.json({ numTriggerd });
}
