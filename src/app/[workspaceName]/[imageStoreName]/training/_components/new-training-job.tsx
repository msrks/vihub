"use client";

import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export function NewTrainingJob({ params }: Props) {
  const router = useRouter();
  const { data: imageStore } = api.imageStore.getByName.useQuery(params);
  const { mutateAsync, isPending } =
    api.trainingJob.prepareDatasetClsS.useMutation();

  const handleClick = async () => {
    if (!imageStore) return;
    toast.info("triggering new training job...");
    await mutateAsync({ imageStoreId: imageStore.id });
    toast.success("new training job has started!");
    router.refresh();
  };

  return (
    <Button size="sm" disabled={isPending} onClick={handleClick}>
      <PlusCircle className="mr-1 size-4" /> New
    </Button>
  );
}
