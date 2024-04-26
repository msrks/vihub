"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import ImageUploadClientSide from "./_components/image-upload-client-side";

export default function Page({
  params: { workspaceName, imageStoreName },
}: {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName,
    imageStoreName,
  });

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <ImageUploadClientSide imageStoreId={imageStore.id} />
    </div>
  );
}
