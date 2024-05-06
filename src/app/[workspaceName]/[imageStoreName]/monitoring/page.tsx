import { api } from "@/trpc/server";
import { ContributionsView } from "@/components/contributions-view";
import { InfiniteImages } from "@/components/infinite-images";
import { Code } from "./_components/code-snippet";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">All Images</h2>
        <Suspense fallback={<Loader />}>
          <Code params={params} />
        </Suspense>
      </div>
      <Suspense fallback={<Loader />}>
        <Monitoring params={params} />
      </Suspense>
    </div>
  );
}

async function Monitoring({
  params: { workspaceName, imageStoreName },
}: Props) {
  const imageStore = await api.imageStore.getByName({
    workspaceName,
    imageStoreName,
  });

  const dataCounts = await api.image.getAllCountsByStoreId({
    imageStoreId: imageStore?.id ?? 0,
  });

  return (
    <>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={imageStore.id} />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </>
  );
}
