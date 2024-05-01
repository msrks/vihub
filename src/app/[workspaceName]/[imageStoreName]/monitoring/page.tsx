"use client";

import { api } from "@/trpc/react";
import { ContributionsView } from "@/components/contributions-view";
import { InfiniteImages } from "@/components/infinite-images";
import Code from "./_components/code-snippet";
import { Loader2 } from "lucide-react";

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
      { imageStoreId: imageStore?.id ?? 0 },
      { enabled: !!imageStore },
    );

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      {/* <PythonSdkLink /> */}
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">All Images</h2>
        <Code imageStore={imageStore} />
      </div>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView isLoading={isLoading} dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </div>
  );
}
