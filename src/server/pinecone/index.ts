import { Pinecone } from "@pinecone-database/pinecone";

export type Metadata = {
  imagePath: string;
};

const pinecone = new Pinecone();
export const vdb = (namespace: string) =>
  pinecone.index(process.env.PINECONE_INDEX!).namespace(namespace);
export const vdbWithMetadaba = (namespace: string) =>
  pinecone.index<Metadata>(process.env.PINECONE_INDEX!).namespace(namespace);
