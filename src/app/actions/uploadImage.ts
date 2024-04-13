"use server";

import { db } from "@/server/db";
import { images } from "@/server/db/schema";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(imageStoreId: number, formData: FormData) {
  const file = formData.get("image") as File;
  const filename = `${process.env.BLOB_NAME_SPACE!}/${file.name}`;
  const blob = await put(filename, file, { access: "public" });

  await db.insert(images).values({
    url: blob.url,
    downloadUrl: blob.downloadUrl,
    imageStoreId,
  });
  revalidatePath("/[workspaceName]/[imageStoreName]/monitoring", "page");
  return { message: "Image uploaded successfully!" };
}
