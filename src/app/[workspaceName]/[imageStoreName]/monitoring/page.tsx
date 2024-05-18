import { Suspense } from "react";

import { ContributionsView } from "@/components/contributions-view";
import { InfiniteImages } from "@/components/infinite-images";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";

import { Code } from "./_components/code-snippet";

interface ISProps {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: ISProps) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">All Images</h2>
        <Suspense>
          <Code params={params} />
        </Suspense>
      </div>
      <Suspense fallback={<Loader />}>
        <Monitoring params={params} />
      </Suspense>
    </div>
  );
}

async function Monitoring({ params }: ISProps) {
  const { id } = await api.imageStore.getByName(params);

  const dataCounts = await api.image.getAllCountsByStoreId({
    imageStoreId: id,
  });

  return (
    <>
      {dataCounts && dataCounts?.length > 0 ? (
        <>
          <ContributionsView dataCounts={dataCounts} />
          <InfiniteImages imageStoreId={id} />
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no images.</p>
        </div>
      )}
    </>
  );
}
