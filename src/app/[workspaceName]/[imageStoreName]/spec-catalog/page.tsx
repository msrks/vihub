import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { imageStoreTypeList } from "@/server/db/schema";
import { api } from "@/trpc/server";

import ReferenceImagesPage from "../reference-images/page";
import { colClsM, colClsS, colDet } from "./_components/columns";
import { NewLabelClass } from "./_components/new-label-class";

import type { ImageStoreType } from "@/server/db/schema";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center gap-1">
      {imageStoreTypeList.map((type) => (
        <div className="flex w-full flex-col gap-1" key={type}>
          <div className="container flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">
              Label Classes (type == `{type}`)
            </h2>
            <div className="ml-auto mr-4 ">
              <NewLabelClass params={params} type={type} />
            </div>
          </div>
          <Suspense>
            <LabelClasses params={params} type={type} />
          </Suspense>
        </div>
      ))}

      <ReferenceImagesPage params={params} />
    </div>
  );
}

const columns = {
  clsS: colClsS,
  clsM: colClsM,
  det: colDet,
};

async function LabelClasses({
  params,
  type,
}: Props & { type: ImageStoreType }) {
  const { id, type: imageType } = await api.imageStore.getByName(params);
  const data = await api.labelClass.getAll({ imageStoreId: id });
  const dataset = data.filter((d) => d.type === type);
  if (imageType !== type && dataset.length === 0) return null;
  return (
    <div className="container">
      <DataTable columns={columns[type]} data={dataset} />
    </div>
  );
}
