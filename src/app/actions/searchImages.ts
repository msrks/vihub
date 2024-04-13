"use server";

import { vdbWithMetadaba } from "@/server/pinecone";
import { getVectorByReplicate } from "@/server/replicate";

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
  return result.matches?.map((match) => {
    const { metadata } = match;
    return {
      src: metadata ? metadata.imagePath : "",
      score: match.score,
    };
  });
};

export async function searchImages(queryText: string, namespace: string) {
  return await queryImages(queryText, namespace);
}
