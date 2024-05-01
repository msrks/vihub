"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { InfiniteImages } from "@/components/infinite-images";
import { ContributionsView } from "@/components/contributions-view";

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
  const { data: dataCounts, isLoading } =
    api.image.getAllCountsByStoreId.useQuery(
      { imageStoreId: imageStore?.id ?? 0, onlyUnlabeled: true },
      { enabled: !!imageStore },
    );

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Unlabeld Images
        </h2>
      </div>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView isLoading={isLoading} dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} onlyUnlabeled />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </div>
  );
}
