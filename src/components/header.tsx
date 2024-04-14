"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { api } from "@/trpc/react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

function WorkspaceNav({ current }: { current: string }) {
  const { data } = api.workspace.getAll.useQuery();

  return (
    <>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1">
            {current}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {data?.map((ws, i) => (
              <Link key={i} href={`/${ws.name}`}>
                <DropdownMenuItem>{ws.name}</DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>
    </>
  );
}

function ImageStoreNav({
  wsName,
  current,
}: {
  wsName: string;
  current: string;
}) {
  const { data: ws } = api.workspace.getByName.useQuery({ name: wsName });
  const { data } = api.imageStore.getAll.useQuery(
    { workspaceId: ws?.id ?? 0 },
    { enabled: !!ws },
  );

  return (
    <>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1">
            {current}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {data?.map((imageStore, i) => (
              <Link key={i} href={`/${wsName}/${imageStore.name}`}>
                <DropdownMenuItem>{imageStore.name}</DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>
    </>
  );
}

function Hero() {
  return (
    <BreadcrumbItem>
      <Link href="/" className="text-xl font-semibold text-foreground">
        <span className="text-primary">V</span>
        <span className="hidden  md:inline">isual </span>
        <span className="text-primary">I</span>
        <span className="hidden  md:inline">nspection </span>
        <span className="text-primary"> Hub</span>
      </Link>
    </BreadcrumbItem>
  );
}

function UserMenu({ session }: { session: Session | null }) {
  return (
    <div className="ml-8 flex items-center text-muted-foreground">
      {session?.user ? (
        <Button
          onClick={() => signOut()}
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image ?? undefined} alt="avatar" />
            <AvatarFallback>
              {session.user.name?.slice(0) ?? "A"}
            </AvatarFallback>
          </Avatar>
        </Button>
      ) : (
        <Button onClick={() => signIn("github")} variant="secondary">
          Sign In
        </Button>
      )}
    </div>
  );
}

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const wsName = pathname.split("/")[1];
  const imageStoreName = pathname.split("/")[2];

  return (
    <div className="min-h-[48px] w-full border-b">
      <div className="flex items-center justify-between px-2 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <Hero />
            {session?.user && wsName && <WorkspaceNav current={wsName} />}
            {session?.user && imageStoreName && wsName && (
              <ImageStoreNav wsName={wsName} current={imageStoreName} />
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <UserMenu session={session} />
      </div>
    </div>
  );
};

export default Header;
