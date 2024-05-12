"use client";

import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export function NewTrainingJob({ params }: Props) {
  const { data: imageStore } = api.imageStore.getByName.useQuery(params);
  const { mutateAsync, isPending } =
    api.trainingJob.prepareDatasetClsS.useMutation();

  const handleClick = async () => {
    if (!imageStore) return;

    await mutateAsync({ imageStoreId: imageStore.id });
  };

  return (
    <Button size="sm" disabled={isPending} onClick={handleClick}>
      <PlusCircle className="mr-1 size-4" /> New
    </Button>
  );
}
