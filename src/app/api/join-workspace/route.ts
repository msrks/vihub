import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const searchParams = req.nextUrl.searchParams;
  const secretKey = searchParams.get("secretKey");
  if (secretKey !== process.env.VIHUB_SECRET_KEY)
    throw new Error("Invalid secret key");

  const wsId = searchParams.get("wsId");
  if (wsId === null) throw new Error("Invalid workspace id");

  await api.user.joinWorkspace({
    workspaceId: parseInt(wsId),
  });

  redirect("/");
}
