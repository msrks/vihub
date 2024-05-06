import { api } from "@/trpc/server";
import { InfiniteImages } from "@/components/infinite-images";
import { ContributionsView } from "@/components/contributions-view";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Labeled Images
        </h2>
      </div>
      <Suspense fallback={<Loader />}>
        <Dataset params={params} />
      </Suspense>
    </div>
  );
}

async function Dataset({ params: { workspaceName, imageStoreName } }: Props) {
  const imageStore = await api.imageStore.getByName({
    workspaceName,
    imageStoreName,
  });

  const dataCounts = await api.image.getAllCountsByStoreId({
    imageStoreId: imageStore?.id ?? 0,
    onlyLabeled: true,
  });

  return (
    <>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} onlyLabeled />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </>
  );
}
