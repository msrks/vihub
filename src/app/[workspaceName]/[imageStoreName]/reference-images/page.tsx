import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";

import { columns } from "./_components/columns";
import NewReferenceImages from "./_components/new-reference-images";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container mt-2 flex items-center justify-between">
        <h2 className="my-2 text-xl font-semibold tracking-tight">
          Reference Images
        </h2>
        <div className="ml-auto mr-4 ">
          <NewReferenceImages params={params} />
        </div>
      </div>
      <Suspense fallback={<Loader />}>
        <ReferenceImages params={params} />
      </Suspense>
    </div>
  );
}

async function ReferenceImages({ params }: Props) {
  const imageStore = await api.imageStore.getByName(params);

  const referenceImages = await api.referenceImage.getAll({
    imageStoreId: imageStore.id,
  });

  return (
    <div className="container">
      <DataTable columns={columns} data={referenceImages} />
    </div>
  );
}
