"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import NewReferenceImages from "./_components/new-reference-images";

export default function ReferenceImagesPage({
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
  const { data, isLoading } = api.referenceImage.getAll.useQuery(
    { imageStoreId: imageStore?.id ?? 0 },
    { enabled: !!imageStore },
  );

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container mt-2 flex items-center justify-between">
        <h2 className="my-2 text-2xl font-semibold tracking-tight">
          Reference Images
        </h2>
        <div className="ml-auto mr-4 ">
          <NewReferenceImages imageStoreId={imageStore.id} />
        </div>
      </div>
      <div className="container">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {data && <DataTable columns={columns} data={data} />}
      </div>
    </div>
  );
}
