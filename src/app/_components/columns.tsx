import { format } from "date-fns";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
type WorkspaceWithMembers = RouterOutputs["workspace"]["getAll"][number];

export const columns: ColumnDef<WorkspaceWithMembers>[] = [
  { header: "Name", cell: Name },
  { header: "Created At", cell: CreatedAt },
  { header: "Members", cell: Members },
];

function Name({ row }: { row: Row<WorkspaceWithMembers> }) {
  const { name } = row.original.workspaces;
  return (
    <Link href={`/${name}`} className={buttonVariants({ variant: "link" })}>
      {name}
    </Link>
  );
}

function CreatedAt({ row }: { row: Row<WorkspaceWithMembers> }) {
  const { createdAt } = row.original.workspaces;
  return <span>{format(new Date(createdAt), "yyyy-MM-dd")}</span>;
}

function Members({ row }: { row: Row<WorkspaceWithMembers> }) {
  const { members } = row.original;
  return (
    <div className="flex gap-1">
      {members.map((m, i) => (
        <Avatar key={i} className="size-6">
          <AvatarImage src={m} alt="" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
