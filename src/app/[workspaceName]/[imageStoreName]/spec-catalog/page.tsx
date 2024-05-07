import { api } from "@/trpc/server";
import { Loader2 } from "lucide-react";
import { NewLabelClass } from "./_components/new-label-class";
import { DataTable } from "@/components/data-table";
import { columns } from "./_components/columns";
import ReferenceImagesPage from "../reference-images/page";
import { Loader } from "@/components/ui/loader";
import { Suspense } from "react";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center gap-2">
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
      <div className="flex w-full flex-col">
        <div className="container mt-2 flex items-center justify-between">
          <h2 className="my-2 text-2xl font-semibold tracking-tight">
            Multi Label Classes
          </h2>
          <div className="ml-auto mr-4 ">
            <NewLabelClass params={params} isMultiClass />
          </div>
        </div>
        <Suspense fallback={<Loader />}>
          <LabelClasses params={params} isMultiClass />
        </Suspense>
      </div>
      <ReferenceImagesPage params={params} />
    </div>
  );
}

async function LabelClasses({
  params,
  isMultiClass,
}: Props & { isMultiClass?: boolean }) {
  const imageStore = await api.imageStore.getByName(params);

  const labelClasses = await api.labelClass.getAllWithCount({
    imageStoreId: imageStore.id,
  });

  return (
    <div className="container">
      <DataTable
        columns={columns}
        data={labelClasses.filter((d) =>
          isMultiClass
            ? d.labelClasses.isMultiClass
            : !d.labelClasses.isMultiClass,
        )}
      />
    </div>
  );
}
