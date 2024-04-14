"use client";

import { api } from "@/trpc/react";
import { Pencil } from "lucide-react";

interface Props {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}

export default function Page({ params }: Props) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName: params.workspaceName,
    imageStoreName: params.imageStoreName,
  });

  if (!imageStore) return null;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            {imageStore.name}
            {/* TODO edit imageStoreName */}
            <Pencil className="size-4" onClick={() => alert("edit")} />
          </h2>
        </div>
      </div>
    </div>
  );
}
