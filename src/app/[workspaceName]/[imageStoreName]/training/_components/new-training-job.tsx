"use client";

import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export function NewTrainingJob({ params }: Props) {
  const router = useRouter();
  const { data: IS } = api.imageStore.getByName.useQuery(params);
  const { mutateAsync, isPending } =
    api.trainingJob.prepareDataset.useMutation();

  const handleClick = async () => {
    toast.info("triggering new training job...");
    await mutateAsync({ imageStoreId: IS!.id, type: IS!.type });
    toast.success("new training job has started!");
    router.refresh();
  };

  return (
    <Button size="sm" disabled={isPending || !IS} onClick={handleClick}>
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <PlusCircle className="mr-1 size-4" /> New
        </>
      )}
    </Button>
  );
}
