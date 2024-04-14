"use server";

import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function uploadImage(imageStoreId: number, formData: FormData) {
  const files = formData.getAll("image") as File[];
  await Promise.all(
    files.map((file) => api.image.create({ imageStoreId, file })),
  );
  revalidatePath("/[workspaceName]/[imageStoreName]/monitoring", "page");
  return { message: "Image uploaded successfully!" };
}
