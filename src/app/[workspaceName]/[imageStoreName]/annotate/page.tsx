"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { ImageViewerComponent } from "@/components/images-viewer";

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
      <div className="container mt-2 flex flex-col gap-2">
        <h2 className="my-2 text-2xl font-semibold tracking-tight">
          Unlabeld Images
        </h2>
      </div>
      <ImageViewerComponent
        imageStoreId={imageStore.id}
        setAsQueryImage={() => void 0}
        onlyUnlabeled
      />
    </div>
  );
}
