import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { api } from "@/trpc/server";

import ReferenceImagesPage from "../reference-images/page";
import { columns } from "./_components/columns";
import { NewLabelClass } from "./_components/new-label-class";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center gap-1">
      <div className="flex w-full flex-col gap-1">
        <div className="container flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            Label Classes
          </h2>
          <div className="ml-auto mr-4 ">
            <NewLabelClass params={params} />
          </div>
        </div>
        <Suspense>
          <LabelClasses params={params} />
        </Suspense>
      </div>

      <ReferenceImagesPage params={params} />
    </div>
  );
}

async function LabelClasses({ params }: Props) {
  const { id } = await api.imageStore.getByName(params);
  const data = await api.labelClass.getAll({ imageStoreId: id });
  return (
    <div className="container">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
