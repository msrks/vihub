"use client";

import { buttonVariants } from "@/components/ui/button";
import { type RouterOutputs } from "@/server/api/root";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export type ImageStore = RouterOutputs["imageStore"]["getAll"][number];

export const getColumns = (workspaceName: string): ColumnDef<ImageStore>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const { name } = row.original;
      return (
        <Link
          href={`/${workspaceName}/${name}`}
          className={buttonVariants({ variant: "link" })}
        >
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
  {
    accessorKey: "thumbnailUrl",
    header: "Thumbnail",
    cell: ({ row }) => {
      const { thumbnailUrl } = row.original;
      return (
        <Image
          src={`${thumbnailUrl ?? ""}`}
          alt="thumbnail image"
          className="h-10 w-10"
          width={40}
          height={40}
        />
      );
    },
  },
];
