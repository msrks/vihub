import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { api } from "@/trpc/server";

import ReferenceImagesPage from "../reference-images/page";
import { colClsM, colClsS, colDet } from "./_components/columns";
import { NewLabelClass } from "./_components/new-label-class";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  const { type } = await api.imageStore.getByName(params);

  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      <div className="flex w-full flex-col">
        <div className="container mt-2 flex items-center justify-between">
          <h2 className="my-2 text-2xl font-semibold tracking-tight">
            Label Classes (type == `{type}`)
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

const columns = {
  clsS: colClsS,
  clsM: colClsM,
  det: colDet,
};

async function LabelClasses({ params }: Props) {
  const { id, type } = await api.imageStore.getByName(params);
  const data = await api.labelClass.getAll({ imageStoreId: id });

  return (
    <div className="container">
      <DataTable
        columns={columns[type]}
        data={data.filter((d) => d.type === type)}
      />
    </div>
  );
}
