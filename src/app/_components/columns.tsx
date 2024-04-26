"use client";

import { buttonVariants } from "@/components/ui/button";
import { type RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type WorkspaceWithMembers = RouterOutputs["workspace"]["getAll"][number];

function MembersCell({
  row: {
    original: { members },
  },
}: {
  row: Row<WorkspaceWithMembers>;
}) {
  return (
    <div className="flex gap-1">
      {members.map((m, i) => (
        <Avatar key={i} className="size-6">
          <AvatarImage src={m} alt="@shadcn" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}

function CreatedAtCell({
  row: {
    original: {
      workspaces: { createdAt },
    },
  },
}: {
  row: Row<WorkspaceWithMembers>;
}) {
  return <span>{format(new Date(createdAt), "yyyy-MM-dd")}</span>;
}

function NameCell({
  row: {
    original: {
      workspaces: { name },
    },
  },
}: {
  row: Row<WorkspaceWithMembers>;
}) {
  return (
    <Link href={`/${name}`} className={buttonVariants({ variant: "link" })}>
      {name}
    </Link>
  );
}

export const columns: ColumnDef<WorkspaceWithMembers>[] = [
  { header: "Name", cell: NameCell },
  { header: "Created At", cell: CreatedAtCell },
  { header: "Members", cell: MembersCell },
];
