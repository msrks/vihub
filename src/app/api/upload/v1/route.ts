import { formatDate } from "date-fns";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import {
  imageStores,
  labelClasses,
  labelsDet,
  multiClassAiPredictions,
  workspaces,
} from "@/server/db/schema";
import { api } from "@/trpc/server";

import type { NextRequest } from "next/server";

export const maxDuration = 300;

const schema = z.object({
  imageStoreId: z.coerce.number(),
  apiKey: z.string(),
  skipAnnotation: z.coerce
    .string()
    .optional()
    .nullish()
    .transform((x) => ["True", "true"].includes(x ?? "")),
  aiLabelKey: z
    .string()
    .optional()
    .nullish()
    .transform((x) => x ?? undefined),
  aiLabelConfidence: z
    .string()
    .optional()
    .nullish()
    .transform((x) => x ?? undefined),
  createdAt: z.coerce
    .date()
    .optional()
    .nullish()
    .transform((x) => x ?? undefined),
  multiLabelString: z
    .string()
    .optional()
    .nullish()
    .transform((x) => x ?? undefined),
  detLabelString: z
    .string()
    .optional()
    .nullish()
    .transform((x) => x ?? undefined),
});

const schemaClsM = z.array(
  z.object({
    labelKey: z.string(),
    confidence: z.coerce.number(),
    aiModelKey: z
      .string()
      .optional()
      .nullish()
      .transform((x) => x ?? undefined),
    isPositive: z.boolean(),
  }),
);

const schemaDet = z.array(
  z.object({
    type: z.enum(["ai", "human"]),
    labelKey: z.string(),
    xMin: z.coerce.number(),
    yMin: z.coerce.number(),
    xMax: z.coerce.number(),
    yMax: z.coerce.number(),
    confidence: z.coerce
      .number()
      .optional()
      .nullish()
      .transform((x) => x ?? undefined),
    aiModelKey: z
      .string()
      .optional()
      .nullish()
      .transform((x) => x ?? undefined),
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
      detLabelString,
      skipAnnotation,
    } = schema.parse({
      imageStoreId: req.nextUrl.searchParams.get("storeId"),
      apiKey: req.headers.get("apiKey"),
      aiLabelKey: formData.get("aiLabelKey"),
      aiLabelConfidence: formData.get("aiLabelConfidence"),
      createdAt: formData.get("createdAt"),
      multiLabelString: formData.get("aiMultiClassLabels"),
      detLabelString: formData.get("detLabelString"),
      skipAnnotation: formData.get("skipAnnotation"),
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
      isLabeled: skipAnnotation,
    });

    switch (imageStoreType) {
      case "clsS":
        return Response.json({ success: true });
      case "clsM":
        if (!multiLabelString) throw new Error("Invalid aiMultiClassLabels");

        const multiLabels = schemaClsM.parse(JSON.parse(multiLabelString));
        await Promise.all(
          multiLabels.map(async ({ labelKey, ...rest }) => {
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
            const labelClassId = ret[0].id;

            await db
              .insert(multiClassAiPredictions)
              .values({ imageId, labelClassId, ...rest });
          }),
        );

        return Response.json({ success: true });
      case "det":
        if (!detLabelString) throw new Error("Invalid detLabelString");

        const detLabels = schemaDet.parse(JSON.parse(detLabelString));
        await Promise.all(
          detLabels.map(async ({ labelKey, ...rest }) => {
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
            const labelClassId = ret[0].id;

            await db
              .insert(labelsDet)
              .values({ imageId, labelClassId, ...rest });
          }),
        );
        return Response.json({ success: true });
      default:
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
