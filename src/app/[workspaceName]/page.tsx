"use client";

import { api } from "@/trpc/react";
import { Loader2, Pencil, Settings, Sparkles } from "lucide-react";
import { DataTable } from "../../components/data-table";
import NewImageStore from "./_components/new-image-store";
import { getColumns } from "./_components/columns";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

function WorkspaceTitleEdit({ id, current }: { id: number; current: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(current);
  const utils = api.useUtils();
  const { mutateAsync } = api.workspace.update.useMutation();
  const router = useRouter();

  const handleSubmit = async () => {
    toast.info("Updating workspaceName...");
    await mutateAsync({ id, name });
    toast.success("workspaceName updated!");
    setOpen(false);
    router.push(name);
    await utils.workspace.invalidate();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">{current}</h2>
          <Pencil className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <form action={handleSubmit} className="flex items-center gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default function Page({
  params: { workspaceName },
}: {
  params: {
    workspaceName: string;
  };
}) {
  const { data: ws } = api.workspace.getByName.useQuery({
    name: workspaceName,
  });

  const { data, isLoading } = api.imageStore.getAllWithCounts.useQuery(
    { workspaceId: ws?.id ?? 0 },
    { enabled: !!ws?.id },
  );

  return (
    <div className="my-2 flex w-full grow flex-col items-center gap-2">
      <div className="container flex items-center ">
        {ws && <WorkspaceTitleEdit id={ws.id} current={workspaceName} />}
        <div className="ml-auto mr-4 flex items-center gap-4">
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/${workspaceName}/settings`}>
              <Settings className="mr-2 size-4" />
              Settings
            </Link>
          </Button>
          <Button size="sm">
            <Sparkles className="mr-2 size-4" />
            Upgrade
          </Button>
        </div>
      </div>
      <Separator />
      <div className="container flex items-center ">
        <h2 className="text-xl tracking-tight">ImageStores</h2>
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
