"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export type ReferenceImage = RouterOutputs["referenceImage"]["getAll"][number];

function ActionCell({
  row: {
    original: { id },
  },
}: {
  row: Row<ReferenceImage>;
}) {
  const utils = api.useUtils();
  const { mutateAsync } = api.referenceImage.deleteById.useMutation();

  const handleClick = async () => {
    toast.info("Deleting reference image...");
    await mutateAsync({ id });
    toast.success("Reference image deleted!");
    await utils.referenceImage.invalidate();
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <Trash2 className="size-4" />
    </Button>
  );
}

export const columns: ColumnDef<ReferenceImage>[] = [
  {
    header: "Image",
    cell: ({
      row: {
        original: { url },
      },
    }) => (
      <Image
        src={url}
        alt="thumbnail image"
        className="size-10"
        width={40}
        height={40}
      />
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
  },
  {
    header: "Actions",
    cell: ActionCell,
  },
];
