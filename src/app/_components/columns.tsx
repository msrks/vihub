"use client";

import { buttonVariants } from "@/components/ui/button";
import { type RouterOutputs } from "@/server/api/root";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

export type Workspace = RouterOutputs["workspace"]["getAll"][number];

export const columns: ColumnDef<Workspace>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { name } = row.original;
      return (
        <Link href={`/${name}`} className={buttonVariants({ variant: "link" })}>
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return <span>{format(new Date(createdAt), "yy/MM/dd HH:mm")}</span>;
    },
  },
];
