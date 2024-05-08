import { formatDate } from "date-fns";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import {
  imageStores,
  labelClasses,
  multiClassAiPredictions,
  workspaces,
} from "@/server/db/schema";
import { api } from "@/trpc/server";

import type { NextRequest } from "next/server";

export const maxDuration = 300;

const schema = z.object({
  imageStoreId: z.coerce.number(),
  apiKey: z.string(),
  aiLabelKey: z.string().optional(),
  aiLabelConfidence: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  multiLabelString: z.string().optional(),
});

const clsMSchema = z.array(
  z.object({
    labelKey: z.string(),
    confidence: z.string().or(z.number()),
    aiModelKey: z.string().optional(),
    isPositive: z.boolean(),
  }),
);

async function validateApiKey({
  imageStoreId,
  apiKey,
}: {
  imageStoreId: number;
  apiKey: string;
}) {
  const ret = await db
    .select({ type: imageStores.type })
    .from(imageStores)
    .innerJoin(workspaces, eq(workspaces.id, imageStores.workspaceId))
    .where(
      and(eq(imageStores.id, imageStoreId), eq(workspaces.apiKey, apiKey)),
    );
  if (!ret[0]) throw new Error("API Key not found");
  return ret[0].type;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("Invalid file");
    const {
      imageStoreId,
      apiKey,
      aiLabelKey,
      aiLabelConfidence,
      createdAt,
      multiLabelString,
    } = schema.parse({
      imageStoreId: req.nextUrl.searchParams.get("storeId"),
      apiKey: req.headers.get("apiKey"),
      aiLabelKey: formData.get("aiLabelKey"),
      aiLabelConfidence: formData.get("aiLabelConfidence"),
      createdAt: formData.get("createdAt"),
      multiLabelString: formData.get("aiMultiClassLabels"),
    });

    const imageStoreType = await validateApiKey({ imageStoreId, apiKey });

    // for debugging
    // console.log({
    //   imageStoreId,
    //   apiKey,
    //   aiLabelKey,
    //   aiLabelConfidence,
    //   createdAt,
    //   multiLabelString,
    //   imageStoreType,
    // });
    // return Response.json({ debug: true });
    // end for debugging

    // upload file & save to DB, VDB
    const { id: imageId } = await api.image.create({
      createdAt,
      createdAtDate: createdAt && formatDate(createdAt, "yyyy-MM-dd"),
      imageStoreId,
      file,
      aiLabelKey,
      aiLabelDetail: aiLabelConfidence
        ? {
            confidence: parseFloat(aiLabelConfidence),
          }
        : undefined,
    });

    if (imageStoreType === "clsS") {
      return Response.json({ success: true });
    } else if (imageStoreType === "clsM") {
      if (!multiLabelString) throw new Error("Invalid aiMultiClassLabels");

      const parsed = clsMSchema.parse(JSON.parse(multiLabelString));
      await Promise.all(
        parsed.map(async ({ labelKey, confidence, aiModelKey, isPositive }) => {
          const ret = await db
            .select()
            .from(labelClasses)
            .where(
              and(
                eq(labelClasses.key, labelKey),
                eq(labelClasses.imageStoreId, imageStoreId),
              ),
            );
          if (!ret[0]) return;
          await db.insert(multiClassAiPredictions).values({
            imageId,
            labelClassId: ret[0].id,
            confidence:
              typeof confidence === "string"
                ? parseFloat(confidence)
                : confidence,
            aiModelKey,
            isPositive,
          });
        }),
      );

      return Response.json({ success: true });
    } else if (imageStoreType === "det") {
      return Response.json({ success: true });
    } else {
      throw new Error("Invalid image store type");
    }
  } catch (e) {
    if (e instanceof Error) {
      return Response.json({ error: e.message });
    } else {
      return Response.json({ error: e });
    }
  }
}
