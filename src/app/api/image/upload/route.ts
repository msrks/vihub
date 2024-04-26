import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { vdb } from "@/server/pinecone";
import { getVectorByReplicate } from "@/server/replicate";
import { type PineconeRecord } from "@pinecone-database/pinecone";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  //   const session = await getServerAuthSession();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({
            // userId: session?.user.id,
            ...JSON.parse(clientPayload!),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          console.info({ blob, tokenPayload });
          const { imageStoreId, humanLabelId } = JSON.parse(tokenPayload!) as {
            imageStoreId: number;
            humanLabelId: number;
          };
          console.info({ imageStoreId, humanLabelId });

          const { url, downloadUrl } = blob;

          // get vector embedding & store it to pinecone
          const vector = await getVectorByReplicate(url);
          const vectorId = createHash("md5").update(url).digest("hex");
          await vdb(imageStoreId.toString()).upsert([
            {
              id: vectorId,
              metadata: { imagePath: url },
              values: vector,
            } satisfies PineconeRecord,
          ]);

          // save to db
          await db.insert(images).values({
            url,
            downloadUrl,
            imageStoreId,
            vectorId,
            humanLabelId,
          });
        } catch (error) {
          console.error(error);
          throw new Error("Could not update user");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
