"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="name">ImageStore name</Label>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" onClick={handleClick}>
          Rename
        </Button>
      </div>
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
      <div className="container">
        <RenameField id={imageStore.id} current={imageStore.name} />
      </div>
    </div>
  );
}
