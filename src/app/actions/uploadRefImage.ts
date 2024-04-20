"use server";

import { api } from "@/trpc/server";

export async function uploadRefImage(imageStoreId: number, formData: FormData) {
  const files = formData.getAll("images") as File[];

  await Promise.all(
    files.map(
      async (file) => await api.referenceImage.create({ imageStoreId, file }),
    ),
  );
  return { message: "Image uploaded successfully!" };
}
