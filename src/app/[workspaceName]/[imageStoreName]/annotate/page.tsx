import { Suspense } from "react";

import { ContributionsView } from "@/components/contributions-view";
import { InfiniteImages } from "@/components/infinite-images";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Unlabeled Images
        </h2>
      </div>
      <Suspense fallback={<Loader />}>
        <Dataset params={params} />
      </Suspense>
    </div>
  );
}

async function Dataset({ params }: Props) {
  const imageStore = await api.imageStore.getByName(params);

  const dataCounts = await api.image.getAllCountsByStoreId({
    imageStoreId: imageStore.id,
    onlyUnlabeled: true,
  });

  return (
    <>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} onlyUnlabeled />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </>
  );
}
