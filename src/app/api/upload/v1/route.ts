import { db } from "@/server/db";
import { labelClasses, multiClassAiPredictions } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { eq } from "drizzle-orm";
import { type NextRequest } from "next/server";

export const maxDuration = 300;

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

    const _image = await api.image.create({
      imageStoreId,
      file,
      aiLabelKey,
      aiLabelDetail: aiLabelConfidence
        ? {
            confidence: parseFloat(aiLabelConfidence),
          }
        : undefined,
    });

    const aiMultiClassLabels = formData.getAll(
      "aiMultiClassLabels",
    ) as string[];

    await Promise.all(
      aiMultiClassLabels.map(async (label) => {
        const parsed = JSON.parse(label.replace(/'/g, '"')) as {
          labelKey: string;
          confidence: string | number;
          aiModelKey: string | undefined;
        };

        const labelClassId = await db
          .select()
          .from(labelClasses)
          .where(eq(labelClasses.key, parsed.labelKey));

        if (!labelClassId[0]) return;

        const res = await db
          .insert(multiClassAiPredictions)
          .values({
            imageId: _image.id,
            labelClassId: labelClassId[0].id,
            confidence:
              typeof parsed.confidence === "string"
                ? parseFloat(parsed.confidence)
                : parsed.confidence,
            aiModelKey: parsed.aiModelKey,
          })
          .returning();
        console.log({ res });
        return;
      }),
    );

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message });
    } else {
      return Response.json({ error: e });
    }
  }
}
