"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import NewLabelClass from "./_components/new-label-class";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import ReferenceImagesPage from "../reference-images/page";

export default function Page({
  params: { workspaceName, imageStoreName },
}: {
  params: { workspaceName: string; imageStoreName: string };
}) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName,
    imageStoreName,
  });
  const { data, isLoading } = api.labelClass.getAllWithCount.useQuery(
    { imageStoreId: imageStore?.id ?? 0 },
    { enabled: !!imageStore },
  );

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      <div className="flex w-full flex-col">
        <div className="container mt-2 flex items-center justify-between">
          <h2 className="my-2 text-2xl font-semibold tracking-tight">
            Single Label Classes
          </h2>
          <div className="ml-auto mr-4 ">
            <NewLabelClass imageStoreId={imageStore.id} />
          </div>
        </div>
        <div className="container">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {data && (
            <DataTable
              columns={columns}
              data={data.filter((d) => !d.labelClasses.isMultiClass)}
            />
          )}
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="container mt-2 flex items-center justify-between">
          <h2 className="my-2 text-2xl font-semibold tracking-tight">
            Multi Label Classes
          </h2>
          <div className="ml-auto mr-4 ">
            <NewLabelClass imageStoreId={imageStore.id} isMultiClass />
          </div>
        </div>
        <div className="container">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {data && (
            <DataTable
              columns={columns}
              data={data.filter((d) => d.labelClasses.isMultiClass)}
            />
          )}
        </div>
      </div>
      <ReferenceImagesPage params={{ workspaceName, imageStoreName }} />
    </div>
  );
}
