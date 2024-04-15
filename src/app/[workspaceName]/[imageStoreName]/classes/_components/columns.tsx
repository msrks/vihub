"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { type ColorResult, TwitterPicker } from "react-color";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type LabelClass = RouterOutputs["labelClass"]["getAll"][number];
export type LabelClassWithCount =
  RouterOutputs["labelClass"]["getAllWithCount"][number];

function ColorCell({ row }: { row: Row<LabelClassWithCount> }) {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const { mutateAsync } = api.labelClass.update.useMutation();
  const {
    labelClasses: { color, id },
  } = row.original;

  const handleChange = async (c: ColorResult) => {
    toast.info("Updating color...");
    await mutateAsync({ id, color: c.hex });
    toast.success("Color updated!");
    setOpen(false);
    await utils.labelClass.invalidate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={(e) => setOpen(e)}>
      <DropdownMenuTrigger>
        <div
          className="size-3.5 rounded-full"
          style={{ backgroundColor: color ?? "#555555" }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <TwitterPicker
          color={color ?? "#555555"}
          onChangeComplete={handleChange}
          triangle="hide"
          styles={{
            default: {
              body: { backgroundColor: "Background" },
              hash: { color: "Text", backgroundColor: "Background" },
              input: { backgroundColor: "Background", color: "Text" },
              label: { color: "Text" },
            },
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DisplayNameCell({ row }: { row: Row<LabelClassWithCount> }) {
  const [open, setOpen] = useState(false);
  const {
    labelClasses: { displayName, id },
  } = row.original;
  const [value, setValue] = useState(displayName);
  const utils = api.useUtils();
  const { mutateAsync } = api.labelClass.update.useMutation();

  const handleSubmit = async () => {
    toast.info("Updating display name...");
    await mutateAsync({ id, displayName: value });
    toast.success("Display name updated!");
    setOpen(false);
    await utils.labelClass.invalidate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={(e) => setOpen(e)}>
      <DropdownMenuTrigger>
        <span className="flex items-center gap-1">
          {row.original.labelClasses.displayName} <Pencil className="size-3" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
          <Button size="sm">Save</Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<LabelClassWithCount>[] = [
  {
    accessorKey: "labelClasses.color",
    header: "Color",
    cell: ColorCell,
  },
  {
    accessorKey: "labelClasses.key",
    header: "Key",
  },
  {
    accessorKey: "labelClasses.displayName",
    header: "Display Name",
    cell: DisplayNameCell,
  },
  { accessorKey: "count", header: "Count" },
  {
    accessorKey: "labelClasses.spec",
    header: "Spec Definition",
    // TODO: spec definition field
    cell: ({ row }) => (
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt sit veniam
        aspernatur dolore voluptates eius molestias odio, hic, aperiam ducimus
        cumque fugiat. Impedit doloremque temporibus laudantium atque sunt quia
        officia.
      </p>
    ),
  },
];
