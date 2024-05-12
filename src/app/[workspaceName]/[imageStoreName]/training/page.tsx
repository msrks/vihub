import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";

import { columns } from "./_components/columns";
import { NewTrainingJob } from "./_components/new-training-job";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          AutoML Training
        </h2>
        <NewTrainingJob params={params} />
      </div>
      <Suspense fallback={<Loader />}>
        <Training params={params} />
      </Suspense>
    </div>
  );
}

async function Training({ params }: Props) {
  const imageStore = await api.imageStore.getByName(params);
  const trainingJobs = await api.trainingJob.getAll({
    imagesStoreId: imageStore.id,
  });

  return (
    <div className="container">
      <DataTable data={trainingJobs} columns={columns} />
    </div>
  );
}
