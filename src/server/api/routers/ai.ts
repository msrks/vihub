import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getVectorByReplicate } from "@/server/replicate";
import { vdbWithMetadaba } from "@/server/pinecone";
import { images } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const aiRouter = createTRPCRouter({
  searchImages: publicProcedure
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
