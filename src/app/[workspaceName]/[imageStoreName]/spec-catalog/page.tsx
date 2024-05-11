import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";

import ReferenceImagesPage from "../reference-images/page";
import { columns, columnsMulti } from "./_components/columns";
import { NewLabelClass } from "./_components/new-label-class";

interface ISProps {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: ISProps) {
  const { type } = await api.imageStore.getByName(params);

  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      {["clsS", "clsM"].includes(type) && (
        <div className="flex w-full flex-col">
          <div className="container mt-2 flex items-center justify-between">
            <h2 className="my-2 text-2xl font-semibold tracking-tight">
              Single Label Classes
            </h2>
            <div className="ml-auto mr-4 ">
              <NewLabelClass params={params} />
            </div>
          </div>
          <Suspense fallback={<Loader />}>
            <LabelClasses params={params} />
          </Suspense>
        </div>
      )}
      {type === "clsM" && (
        <div className="flex w-full flex-col">
          <div className="container mt-2 flex items-center justify-between">
            <h2 className="my-2 text-2xl font-semibold tracking-tight">
              Multi Label Classes
            </h2>
            <div className="ml-auto mr-4 ">
              <NewLabelClass params={params} isMultiClass />
            </div>
          </div>
          <Suspense>
            <LabelClasses params={params} multi />
          </Suspense>
        </div>
      )}
      {type === "det" && (
        <div className="flex w-full flex-col">
          <div className="container mt-2 flex items-center justify-between">
            <h2 className="my-2 text-2xl font-semibold tracking-tight">
              Detection Label Classes
            </h2>
            <div className="ml-auto mr-4 ">
              <NewLabelClass params={params} isMultiClass />
            </div>
          </div>
          <Suspense>
            <LabelClasses params={params} multi />
          </Suspense>
        </div>
      )}

      <ReferenceImagesPage params={params} />
    </div>
  );
}

async function LabelClasses({ params, multi }: ISProps & { multi?: boolean }) {
  const { id } = await api.imageStore.getByName(params);
  const data = await api.labelClass.getAll({ imageStoreId: id });

  return (
    <div className="container">
      <DataTable
        columns={!multi ? columns : columnsMulti}
        data={data.filter((d) => (multi ? d.isMultiClass : !d.isMultiClass))}
      />
    </div>
  );
}
