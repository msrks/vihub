"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { DataTable } from "../../components/data-table";
import NewImageStore from "./_components/new-image-store";
import { getColumns } from "./_components/columns";

interface Props {
  params: {
    workspaceName: string;
  };
}

export default function Page({ params: { workspaceName } }: Props) {
  const { data: ws } = api.workspace.getByName.useQuery({
    name: workspaceName,
  });

  const { data, isLoading } = api.imageStore.getAllWithCounts.useQuery(
    { workspaceId: ws?.id ?? 0 },
    { enabled: !!ws?.id },
  );

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container mt-2 flex items-center justify-between">
        <h2 className="my-2 text-2xl font-semibold tracking-tight">
          ImageStores
        </h2>
        <div className="ml-auto mr-4 ">
          {ws && <NewImageStore workspaceId={ws?.id} />}
        </div>
      </div>
      <div className="container">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {data && <DataTable columns={getColumns(workspaceName)} data={data} />}
      </div>
    </div>
  );
}
