import { api } from "@/trpc/server";
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. validate api key
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("storeId");
    if (!id) throw new Error("Invalid image store id");
    const imageStoreId = parseInt(id);

    const apiKey = req.headers.get("apiKey");
    if (!apiKey) throw new Error("No API Key");
    const result = await api.imageStore.verifyApiKey({
      id: imageStoreId,
      apiKey,
    });
    if (!result) throw new Error("Invalid API Key");

    // 2, upload file & save to DB, VDB
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("Invalid file");
    const aiLabelKey = formData.get("aiLabelKey") as string;
    const aiLabelConfidence = formData.get("aiLabelConfidence") as string;

    await api.image.create({
      imageStoreId,
      file,
      aiLabelKey,
      aiLabelDetail: aiLabelConfidence
        ? {
            confidence: parseFloat(aiLabelConfidence),
          }
        : undefined,
    });
    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message });
    } else {
      return Response.json({ error: e });
    }
  }
}
