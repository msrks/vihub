/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { format, parse } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { getSidebarNavItems } from "@/app/[workspaceName]/[imageStoreName]/_components/sidebar-nav-items";
import {
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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
              <Link key={i} href={`/${ws.workspaces.name}`}>
                <DropdownMenuItem>{ws.workspaces.name}</DropdownMenuItem>
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

function HeaderNavMain() {
  // @ts-ignore
  const pathname = usePathname();
  const workspaceName = pathname.split("/")[1];
  const imageStoreName = pathname.split("/")[2];
  const menuItem = pathname.split("/")[3];
  const date = pathname.split("/")[4];

  if (!workspaceName) return null;
  return (
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
              {menuItem === "monitoring" && date && (
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
  );
}

export function HeaderNav() {
  const { data } = useSession();
  if (!data?.user) return null;
  return <HeaderNavMain />;
}
