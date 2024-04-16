"use client";

import { buttonVariants } from "@/components/ui/button";
import { type RouterOutputs } from "@/server/api/root";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export type ImageStore = RouterOutputs["imageStore"]["getAll"][number];
export type ImageStoreWithCount =
  RouterOutputs["imageStore"]["getAllWithCounts"][number];

export const getColumns = (
  workspaceName: string,
): ColumnDef<ImageStoreWithCount>[] => [
  {
    accessorKey: "imageStores.name",
    header: "Name",
    cell: ({ row }) => {
      const {
        imageStores: { name },
      } = row.original;
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
    accessorKey: "imageStores.createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const {
        imageStores: { createdAt },
      } = row.original;
      return <span>{format(new Date(createdAt), "yy/MM/dd HH:mm")}</span>;
    },
  },
  {
    accessorKey: "imageStores.thumbnailUrl",
    header: "Thumbnail",
    cell: ({ row }) => {
      const {
        imageStores: { thumbnailUrl },
      } = row.original;
      return thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt="thumbnail image"
          className="h-10 w-10"
          width={40}
          height={40}
        />
      ) : (
        <div className="h-10 w-10 border" />
      );
    },
  },
  {
    accessorKey: "count",
    header: "Number of Images",
  },
];
