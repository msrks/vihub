"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import type { Workspace } from "@/app/_components/columns";
import { Copy, ImageIcon, Key, Sparkles, StoreIcon } from "lucide-react";

function Billing({ ws }: { ws: Workspace }) {
  return (
    <div className="w-full space-y-1">
      <Label htmlFor="name" className="flex items-center gap-1">
        <Sparkles className="size-4" />
        Plan
      </Label>
      <div className="ml-4 flex w-full items-center space-x-2">
        <div className="flex items-center gap-2">
          {/* TODO */}
          <span>hobby</span>
        </div>
      </div>
    </div>
  );
}

function Usage({ ws }: { ws: Workspace }) {
  const { data: numImages } =
    api.workspace.getCountOfImagesAssosiatedToWorkspace.useQuery({ id: ws.id });
  const { data: users } = api.user.getByWorkspaceId.useQuery({
    workspaceId: ws.id,
  });
  const { data: numImageStores } =
    api.imageStore.getCountByWorkspaceId.useQuery({ workspaceId: ws.id });

  return (
    <>
      <div className="w-full space-y-1">
        <Label htmlFor="name" className="flex items-center gap-1">
          <ImageIcon className="size-4" />
          Original Images
        </Label>
        <div className="ml-4 flex w-full items-center space-x-2">
          {ws.apiKey && (
            <div className="flex items-center gap-2">
              <span>{numImages} / 10,000</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full space-y-1">
        <Label htmlFor="name" className="flex items-center gap-1">
          <ImageIcon className="size-4" />
          Generated Images
        </Label>
        <div className="ml-4 flex w-full items-center space-x-2">
          {ws.apiKey && (
            <div className="flex items-center gap-2">
              {/* TODO */}
              <span>0 / 50,000</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full space-y-1">
        <Label htmlFor="name" className="flex items-center gap-1">
          <StoreIcon className="size-4" />
          ImageStores
        </Label>
        <div className="ml-4 flex w-full items-center space-x-2">
          {ws.apiKey && (
            <div className="flex items-center gap-2">
              <span>{numImageStores} / 100</span>
            </div>
          )}
        </div>
      </div>
      <div className="w-full space-y-1">
        <Label htmlFor="name" className="flex items-center gap-1">
          <StoreIcon className="size-4" />
          Workspace Members
        </Label>
        <div className="ml-4 flex w-full items-center space-x-2">
          {ws.apiKey && (
            <div className="flex items-center gap-2">
              <span>{users?.length} / 5</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function APIKey({ ws }: { ws: Workspace }) {
  const utils = api.useUtils();
  const { mutateAsync } = api.workspace.regenerateAPIKey.useMutation();

  const handleClick = async () => {
    toast.info("Regenerating API key...");
    await mutateAsync({ id: ws.id });
    toast.success("API key regenerated!");
    await utils.workspace.getByName.invalidate();
  };

  const copyTextToClipboard = async (txt: string) => {
    await navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full space-y-1">
      <Label htmlFor="name">
        <Key className="mr-1 inline size-4" />
        API Key
      </Label>
      <div className="ml-4 flex w-full items-center space-x-2">
        {ws.apiKey && (
          <div className="flex items-center gap-2">
            <span>{ws.apiKey}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyTextToClipboard(ws.apiKey!)}
            >
              <Copy className="size-4" />
            </Button>
          </div>
        )}
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          onClick={handleClick}
        >
          Regenerate
        </Button>
      </div>
    </div>
  );
}

function DeleteField({ ws }: { ws: Workspace }) {
  const utils = api.useUtils();
  const { mutateAsync } = api.workspace.deleteById.useMutation();
  const router = useRouter();

  const handleClick = async () => {
    toast.info("Deleting workspace...");
    await mutateAsync({ id: ws.id });
    toast.success("Workspace deleted!");
    router.push(`/`);
    await utils.workspace.invalidate();
  };

  return (
    <div className="flex w-full max-w-3xl items-center justify-between space-y-1">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Delete this workspace</Label>
        <Label className="text-muted-foreground ">
          Deleting this workspace will delete all imageStores associated with
          it.
        </Label>
      </div>
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        onClick={handleClick}
      >
        Delete
      </Button>
    </div>
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

  if (!ws) return null;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex flex-col gap-4 px-2 py-4">
        <h2 className="text-xl font-semibold">Plan</h2>
        <Billing ws={ws} />
        <Separator />
        <h2 className="text-xl font-semibold">Workspace Usage</h2>
        <Usage ws={ws} />
        <Separator />
        <h2 className="text-xl font-semibold">Workspace API</h2>
        <APIKey ws={ws} />
        <Separator />
        <h2 className="text-xl font-semibold text-destructive">Danger zone</h2>
        <DeleteField ws={ws} />
      </div>
    </div>
  );
}
