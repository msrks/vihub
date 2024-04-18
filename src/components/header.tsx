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
import { usePathname, useRouter } from "next/navigation";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { getSidebarNavItems } from "@/app/[workspaceName]/[imageStoreName]/_components/sidebar-nav-items";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { ThemeToggle } from "./theme-toggle";

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
  workspaceName,
  current,
}: {
  workspaceName: string;
  current: string;
}) {
  const { data: ws } = api.workspace.getByName.useQuery({
    name: workspaceName,
  });
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
            {data?.map((d, i) => (
              <Link key={i} href={`/${workspaceName}/${d.name}`}>
                <DropdownMenuItem>{d.name}</DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </BreadcrumbItem>
    </>
  );
}

function MenuItemNav({
  workspaceName,
  imageStoreName,
  current,
}: {
  workspaceName: string;
  imageStoreName: string;
  current: string;
}) {
  const items = getSidebarNavItems(workspaceName, imageStoreName);

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
            {items?.map((item, i) => (
              <Link key={i} href={item.href}>
                <DropdownMenuItem>{item.title}</DropdownMenuItem>
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
    <div className="flex items-center text-muted-foreground">
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

function DatePickerNav({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    parse(current, "yyyy-MM-dd", new Date()),
  );
  const router = useRouter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "justify-start p-0 text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-1 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        {/* TODO: only highlight to the data existed date */}
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            d ? router.push(format(d, "yyyy-MM-dd")) : router.push("../");
            d && setDate(d);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const workspaceName = pathname.split("/")[1];
  const imageStoreName = pathname.split("/")[2];
  const menuItem = pathname.split("/")[3];
  const date = pathname.split("/")[4];

  return (
    <div className="min-h-[48px] w-full border-b">
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <Hero />
            {session?.user && workspaceName && (
              <>
                <WorkspaceNav current={workspaceName} />
                {imageStoreName && (
                  <>
                    <ImageStoreNav
                      workspaceName={workspaceName}
                      current={imageStoreName}
                    />
                    {menuItem && (
                      <>
                        <MenuItemNav
                          workspaceName={workspaceName}
                          imageStoreName={imageStoreName}
                          current={menuItem}
                        />
                        {date && (
                          <>
                            <BreadcrumbSeparator>/</BreadcrumbSeparator>
                            <BreadcrumbItem>
                              <DatePickerNav current={date} />
                            </BreadcrumbItem>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mx-auto" />
        <ThemeToggle />
        <UserMenu session={session} />
      </div>
    </div>
  );
};

export default Header;
