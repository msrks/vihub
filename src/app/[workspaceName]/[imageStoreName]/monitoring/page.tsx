"use client";

import { api } from "@/trpc/react";
import { ContributionsView } from "@/components/contributions-view";
import { InfiniteImages } from "@/components/infinite-images";
import Code from "./_components/code-snippet";

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

  if (!imageStore) return null;

  return (
    <div className="relative flex w-full grow flex-col items-center">
      {/* <PythonSdkLink /> */}
      <Code imageStore={imageStore} className="absolute right-0 top-0" />

      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView isLoading={isLoading} dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no data yet.</p>
        </div>
      )}
    </div>
  );
}
