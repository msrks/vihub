import { eq } from "drizzle-orm";
import OpenAI from "openai";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  experimentResults,
  images,
  promptingExperiments,
} from "@/server/db/schema";
import { vdbWithMetadaba } from "@/server/pinecone";
import { getVectorByReplicate } from "@/server/replicate";

import type { ChatCompletionContentPart } from "openai/resources/index.mjs";

const SYSTEM_PROMPT = (displayName: string, specDefinition: string) => `
You are Visual Appearance Inspecton AI in a factory.

- ClassLabel
  - Name: ${displayName}
  - SpecDefinition: """${specDefinition}"""

I will show you an example of the images and results. Please refer to it.

- response format must be json { isPositive: boolean, reason: string }
- isPositive: true if the "Spec Definition" matches to the image, false otherwise
- reason: the reason why you think the image is positive or negative

both field "isPositive" & "reason" must be consistent with the image and with each other.
`;

export const aiRouter = createTRPCRouter({
  runLLM: protectedProcedure
    .input(
      z.object({
        imageStoreId: z.number(),
        labelClassId: z.number(),
        specDefinition: z.string(),
        referenceImages: z.array(
          z.object({
            url: z.string(),
            description: z.string(),
            isPositive: z.boolean(),
          }),
        ),
        labelClassDisplayName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { labelClassDisplayName, ..._input } }) => {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

      const testImages = await ctx.db
        .select()
        .from(images)
        .where(eq(images.selectedForExperiment, true));

      console.log(SYSTEM_PROMPT(labelClassDisplayName, _input.specDefinition));

      const results = await Promise.all(
        testImages.map(async (ti) => {
          const _res = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPT(
                  labelClassDisplayName,
                  _input.specDefinition,
                ),
              },
              {
                role: "user",
                content: [
                  ..._input.referenceImages
                    .map(
                      (image) =>
                        [
                          {
                            type: "image_url",
                            image_url: { url: image.url, detail: "high" },
                          },
                          {
                            type: "text",
                            text: `{
                              isPositive: ${image.isPositive} 
                              reason: In the above image, ${image.description}
                            }`,
                          },
                        ] as ChatCompletionContentPart[],
                    )
                    .flat(),
                  {
                    type: "image_url",
                    image_url: { url: ti.url, detail: "high" },
                  },
                ],
              },
            ],
          });
          return {
            ...(JSON.parse(_res.choices[0]?.message.content ?? "{}") as {
              isPositive: boolean;
              reason: string;
            }),
            testImageId: ti.id,
            testImageUrl: ti.url,
            groundTruth: ti.humanLabelId === _input.labelClassId,
          };
        }),
      );

      const _resultsPositive = results.filter((r) => r.groundTruth);
      const scorePositive = `${_resultsPositive.filter((r) => r.isPositive).length}/${_resultsPositive.length}`;
      const _resultsNegative = results.filter((r) => !r.groundTruth);
      const scoreNegative = `${_resultsNegative.filter((r) => !r.isPositive).length}/${_resultsNegative.length}`;

      const ret = await ctx.db
        .insert(promptingExperiments)
        .values({
          ..._input,
          scorePositive,
          scoreNegative,
        })
        .returning();
      if (!ret[0]) throw new Error("something went wrong..");

      await Promise.all(
        results.map(async (r) => {
          await ctx.db.insert(experimentResults).values({
            promptingExperimentId: ret[0]!.id,
            imageId: r.testImageId,
            isPositiveExample: r.groundTruth,
            predLabel: r.isPositive,
            predReason: r.reason,
          });
        }),
      );
    }),

  searchImages: protectedProcedure
    .input(
      z.object({
        queryText: z.string().min(1),
        namespace: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { queryText, namespace } = input;
      const vector = await getVectorByReplicate(queryText);
      const result = await vdbWithMetadaba(namespace).query({
        vector,
        includeMetadata: true,
        includeValues: true,
        topK: 6,
      });
      return (
        await Promise.all(
          result.matches.map(async (match) => {
            const ret = await ctx.db
              .select()
              .from(images)
              .where(eq(images.url, match.metadata!.imagePath));

            return {
              image: ret[0],
              score: match.score,
            };
          }),
        )
      ).filter((m) => m.image);
    }),
});
