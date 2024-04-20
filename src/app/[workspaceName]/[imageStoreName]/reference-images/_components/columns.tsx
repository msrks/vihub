"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

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

function DescriptionCell({
  row: {
    original: { id, description },
  },
}: {
  row: Row<ReferenceImage>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(description);
  const utils = api.useUtils();
  const { mutateAsync } = api.referenceImage.update.useMutation();

  const handleSubmit = async () => {
    if (!value) return;

    toast.info("Updating spec definition...");
    await mutateAsync({ id, description: value });
    toast.success("Spec definition updated!");
    setOpen(false);
    await utils.referenceImage.invalidate();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <div className="flex items-center gap-1">
          <p className="whitespace-pre-wrap text-start">{description}</p>
          <Pencil className="size-3" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[800px]">
        <form action={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
          />
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
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
    cell: DescriptionCell,
  },
  {
    header: "Actions",
    cell: ActionCell,
  },
];
