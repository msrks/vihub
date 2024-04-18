"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

function RenameField({ id, current }: { id: number; current: string }) {
  const utils = api.useUtils();
  const [name, setName] = useState(current);
  const { mutateAsync } = api.imageStore.rename.useMutation();
  const router = useRouter();

  const handleClick = async () => {
    toast.info("Renaming imageStore...");
    await mutateAsync({ id, name });
    toast.success("ImageStore renamed!");
    router.push(`../${name}/settings`);
    await utils.imageStore.invalidate();
  };

  return (
    <div className="w-full space-y-1">
      <Label htmlFor="name">ImageStore name</Label>
      <div className="flex w-full items-center space-x-2">
        <Input
          id="name"
          value={name}
          className="max-w-48"
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" onClick={handleClick}>
          Rename
        </Button>
      </div>
    </div>
  );
}

function DeleteField({ id }: { id: number }) {
  const utils = api.useUtils();
  const { mutateAsync } = api.imageStore.deleteById.useMutation();
  const router = useRouter();

  const handleClick = async () => {
    toast.info("Deleting imageStore...");
    await mutateAsync({ id });
    toast.success("ImageStore deleted!");
    router.push(`../`);
    await utils.imageStore.invalidate();
  };

  return (
    <div className="flex w-full max-w-3xl items-center justify-between space-y-1">
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Delete this imageStore</Label>
        <Label className="text-muted-foreground ">
          Deleting this imageStore will delete all images associated with it.
        </Label>
      </div>
      <Button type="submit" variant="destructive" onClick={handleClick}>
        Delete
      </Button>
    </div>
  );
}

export default function Page({
  params: { workspaceName, imageStoreName },
}: {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName,
    imageStoreName,
  });

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex flex-col gap-2">
        <h2 className="text-xl font-semibold">General</h2>
        <Separator />
        <RenameField id={imageStore.id} current={imageStore.name} />
        <Separator />
        <h2 className="text-xl font-semibold text-destructive">Danger zone</h2>
        <DeleteField id={imageStore.id} />
      </div>
    </div>
  );
}
