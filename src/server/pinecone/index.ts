import { Pinecone } from "@pinecone-database/pinecone";

export type Metadata = {
  imagePath: string;
};

const pc = new Pinecone();
export const vdb = (namespace: string) =>
  pc.index(process.env.PINECONE_INDEX!).namespace(namespace);
export const vdbWithMetadaba = (namespace: string) =>
  pc.index<Metadata>(process.env.PINECONE_INDEX!).namespace(namespace);
