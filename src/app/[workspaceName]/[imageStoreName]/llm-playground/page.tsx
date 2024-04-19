"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import NewExperiment from "./_components/new-experiment";

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
  const { data, isLoading } = api.promptingExperiment.getAll.useQuery(
    { imagesStoreId: imageStore?.id ?? 0 },
    { enabled: !!imageStore },
  );

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container mt-2 flex items-center justify-between">
        <h2 className="my-2 text-2xl font-semibold tracking-tight">
          Prompting Experiments
        </h2>
        <div className="ml-auto mr-4 ">
          <NewExperiment imageStoreId={imageStore.id} />
        </div>
      </div>
      <div className="container">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {data && <DataTable columns={columns} data={data} />}
      </div>
    </div>
  );
}
