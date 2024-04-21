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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export type ReferenceImage = RouterOutputs["referenceImage"]["getAll"][number];

function ActionCell({
  row: {
    original: {
      reference_image: { id },
    },
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
    original: {
      reference_image: { id, description },
    },
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

function ClassCell({
  row: {
    original: {
      label_class,
      reference_image: { id, imageStoreId },
    },
  },
}: {
  row: Row<ReferenceImage>;
}) {
  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId,
  });

  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const { mutateAsync } = api.referenceImage.update.useMutation();

  const handleSubmit = async (f: FormData) => {
    const _labelClassId = f.get("labelClassId");
    if (!_labelClassId) return setOpen(false);

    const labelClassId = parseInt(_labelClassId as string);
    toast.info("Updating labelClass");
    await mutateAsync({ id, labelClassId });
    toast.success("labelClass updated!");
    setOpen(false);
    await utils.referenceImage.invalidate();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <div className="flex items-center gap-2">
          {label_class && (
            <>
              <div
                className="size-3.5 rounded-full"
                style={{ backgroundColor: label_class.color ?? "#555555" }}
              />
              <span>{label_class.displayName}</span>
            </>
          )}
          <Pencil className="size-3" />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <form action={handleSubmit} className="flex items-center gap-2">
          <Select name="labelClassId">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder=" -- select -- " />
            </SelectTrigger>
            <SelectContent>
              {labelClasses?.map((lc) => (
                <SelectItem key={lc.id} value={lc.id.toString()}>
                  {lc.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function ImageCell({
  row: {
    original: {
      reference_image: { url },
    },
  },
}: {
  row: Row<ReferenceImage>;
}) {
  return (
    <Dialog>
      <DialogTrigger>
        <Image
          src={url}
          alt="thumbnail image"
          className="size-10"
          width={40}
          height={40}
        />
      </DialogTrigger>
      <DialogContent>
        <AspectRatio ratio={16 / 16} className="bg-muted">
          <Image src={url} alt="" fill className="rounded-md object-cover" />
        </AspectRatio>
      </DialogContent>
    </Dialog>
  );
}

export const columns: ColumnDef<ReferenceImage>[] = [
  { header: "Image", cell: ImageCell },
  { header: "Class", cell: ClassCell },
  { header: "Description", cell: DescriptionCell },
  { header: "Actions", cell: ActionCell },
];
