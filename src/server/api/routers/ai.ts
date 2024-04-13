import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getVectorByReplicate } from "@/server/replicate";
import { vdbWithMetadaba } from "@/server/pinecone";

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
      return result.matches?.map((match) => {
        const { metadata } = match;
        return {
          src: metadata ? metadata.imagePath : "",
          score: match.score,
        };
      });
    }),
});
