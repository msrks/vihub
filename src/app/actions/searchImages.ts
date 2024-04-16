"use server";

import { vdbWithMetadaba } from "@/server/pinecone";
import { getVectorByReplicate } from "@/server/replicate";
import { api } from "@/trpc/server";

const queryImages = async (queryText: string, namespace: string) => {
  // const embedder = await getEmbedder();
  // const vector = await embedder.embed(imagePath);
  const vector = await getVectorByReplicate(queryText);
  const result = await vdbWithMetadaba(namespace).query({
    // vector: vector.values,
    vector,
    includeMetadata: true,
    includeValues: true,
    topK: 6,
  });
  return await Promise.all(
    result.matches.map(async (match) => {
      const image = await api.image.getByImagePath({
        imagePath: match.metadata!.imagePath,
      });
      return {
        image,
        score: match.score,
      };
    }),
  );
};

export async function searchImages(queryText: string, namespace: string) {
  return await queryImages(queryText, namespace);
}
