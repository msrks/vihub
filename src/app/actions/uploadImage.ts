"use server";

import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function uploadImage(imageStoreId: number, formData: FormData) {
  const files = formData.getAll("images") as File[];
  const humanLabelId = formData.get("humanLabelId")
    ? parseInt(formData.get("humanLabelId") as string)
    : undefined;

  await Promise.all(
    files.map(
      async (file) =>
        await api.image.create({ imageStoreId, file, humanLabelId }),
    ),
  );
  revalidatePath("/[workspaceName]/[imageStoreName]/monitoring", "page");
  return { message: "Image uploaded successfully!" };
}
