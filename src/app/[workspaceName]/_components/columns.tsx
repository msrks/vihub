"use client";

import { buttonVariants } from "@/components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";

export type ImageStore = RouterOutputs["imageStore"]["getAll"][number];
type ImageStoreWithCount = RouterOutputs["imageStore"]["getTableData"][number];

export const columns: ColumnDef<ImageStoreWithCount>[] = [
  { header: "Name", cell: NameCell },
  { header: "Thumbnail", cell: ThumbnailCell },
  { header: "Number of Images", accessorKey: "count" },
  { header: "Type", accessorKey: "type" },
  { header: "Created At", cell: CreatedAtCell },
];

function NameCell({ row }: { row: Row<ImageStoreWithCount> }) {
  const { workspaceName } = useParams<{ workspaceName: string }>();
  const { name } = row.original;
  return (
    <Link
      href={`/${workspaceName}/${name}`}
      className={buttonVariants({ variant: "link" })}
    >
      {name}
    </Link>
  );
}

function CreatedAtCell({ row }: { row: Row<ImageStoreWithCount> }) {
  const { createdAt } = row.original;
  return <span>{format(new Date(createdAt), "yy/MM/dd HH:mm")}</span>;
}

function ThumbnailCell({ row }: { row: Row<ImageStoreWithCount> }) {
  const { thumbnailUrl: url } = row.original;
  return url ? (
    <Image src={url} alt="" className="size-10" width={40} height={40} />
  ) : (
    <div className="size-10 border" />
  );
}
