import { ChevronDown, Pencil, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { DataTable } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/server";

import { columns } from "./_components/columns";
import InviteUser from "./_components/invite-user";
import NewImageStore from "./_components/new-image-store";

export interface WSProps {
  params: { workspaceName: string };
}

export default async function Page({ params }: WSProps) {
  return (
    <div className="my-2 flex w-full grow flex-col items-center gap-2">
      <div className="container flex items-center gap-4">
        <WorkspaceTitleEdit params={params} />
        <Suspense fallback={<Loader />}>
          <MembersMenu params={params} />
        </Suspense>
        <div className="ml-auto mr-4 flex items-center gap-2">
          <Suspense fallback={<Loader />}>
            <InviteUser params={params} />
          </Suspense>
          <SettingsButton params={params} />
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
          <Suspense fallback={<Loader />}>
            <NewImageStore params={params} />
          </Suspense>
        </div>
      </div>
      <div className="container">
        <Suspense>
          <ImageStoreTable params={params} />
        </Suspense>
      </div>
    </div>
  );
}

function SettingsButton({ params }: WSProps) {
  return (
    <Button size="sm" variant="secondary" asChild>
      <Link href={`/${params.workspaceName}/settings`}>
        <Settings className="mr-2 size-4" />
        Settings
      </Link>
    </Button>
  );
}

async function ImageStoreTable({ params }: WSProps) {
  const ws = await api.workspace.getByName({ name: params.workspaceName });
  const data = await api.imageStore.getTableData({ workspaceId: ws?.id ?? 0 });
  return <DataTable columns={columns} data={data} />;
}

async function MembersMenu({ params }: WSProps) {
  const ws = await api.workspace.getByName({ name: params.workspaceName });

  const users = await api.user.getByWorkspaceId({ workspaceId: ws?.id ?? 0 });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1">
        {users.length > 1 ? `${users?.length} members` : "1 member"}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {users.map((user) => (
          <DropdownMenuItem
            key={user.user.id}
            className="flex items-center gap-1"
          >
            <Avatar className="size-5">
              <AvatarImage src={user.user.image ?? ""} alt="" />
              <AvatarFallback>{user.user.name?.slice(0, 1)}</AvatarFallback>
            </Avatar>
            {user.user.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function WorkspaceTitleEdit({ params }: WSProps) {
  const { id } = await api.workspace.getByName({ name: params.workspaceName });

  const handleSubmit = async (formData: FormData) => {
    "use server";
    const name = formData.get("name") as string;
    await api.workspace.update({ id, name });
    redirect("/" + name);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            {params.workspaceName}
          </h2>
          <Pencil className="size-4" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <form action={handleSubmit} className="flex items-center gap-2">
          <Input required name="name" />
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
