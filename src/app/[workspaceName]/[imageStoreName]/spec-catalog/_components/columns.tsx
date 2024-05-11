"use client";

import { Bot, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TwitterPicker } from "react-color";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

import type { ColorResult } from "react-color";
import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";

type LabelClass = RouterOutputs["labelClass"]["getAll"][number];

interface Props {
  row: Row<LabelClass>;
}

export const colClsS: ColumnDef<LabelClass>[] = [
  { header: "Color", cell: ColorCell },
  { header: "Key", accessorKey: "key" },
  { header: "Display Name", cell: DisplayNameCell },
  { header: "Count: HumanLabel", cell: HumanCountCell },
  { header: "Count: AILabel", cell: AICountCell },
  { header: "Spec Definition", cell: SpecDefinitionCell },
  { header: "Run LLM", cell: RunLLMCell },
  { header: "Delete", cell: DeleteCell },
];

export const colClsM: ColumnDef<LabelClass>[] = [
  { header: "Color", cell: ColorCell },
  { header: "Key", accessorKey: "key" },
  { header: "Display Name", cell: DisplayNameCell },
  { header: "Count: HumanLabel", cell: MultiHumanCountCell },
  { header: "Count: AILabel", cell: MultiAiCountCell },
  { header: "Spec Definition", cell: SpecDefinitionCell },
  { header: "Delete", cell: DeleteCell },
];

export const colDet: ColumnDef<LabelClass>[] = [
  { header: "Color", cell: ColorCell },
  { header: "Key", accessorKey: "key" },
  { header: "Display Name", cell: DisplayNameCell },
  { header: "Count: HumanLabel", cell: DetHumanCountCell },
  { header: "Count: AILabel", cell: DetAiCountCell },
  { header: "Spec Definition", cell: SpecDefinitionCell },
  { header: "Delete", cell: DeleteCell },
];

function DeleteCell({ row }: Props) {
  const { id } = row.original;
  const router = useRouter();
  const { mutateAsync } = api.labelClass.deleteById.useMutation();

  const handleDelete = async () => {
    toast.info("Deleting label class...");
    await mutateAsync({ id });
    toast.success("Label class deleted!");
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button size="sm" variant="ghost">
          <Trash2 className="size-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure to permanently delete
            from our servers?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ColorCell({ row }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync } = api.labelClass.update.useMutation();
  const { color, id } = row.original;

  const handleChange = async (c: ColorResult) => {
    toast.info("Updating color...");
    await mutateAsync({ id, color: c.hex });
    toast.success("Color updated!");
    setOpen(false);
    // await utils.labelClass.invalidate();
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger asChild>
        <div
          className="size-3.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </PopoverTrigger>
      <PopoverContent>
        <TwitterPicker
          color={color}
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
      </PopoverContent>
    </Popover>
  );
}

function DisplayNameCell({ row }: Props) {
  const [open, setOpen] = useState(false);
  const { displayName, id } = row.original;
  const [value, setValue] = useState(displayName);
  const router = useRouter();
  const { mutateAsync } = api.labelClass.update.useMutation();

  const handleSubmit = async () => {
    toast.info("Updating display name...");
    await mutateAsync({ id, displayName: value });
    toast.success("Display name updated!");
    setOpen(false);
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <span className="flex items-center gap-1">
          {displayName} <Pencil className="size-3" />
        </span>
      </PopoverTrigger>
      <PopoverContent>
        <form action={handleSubmit} className="flex items-center gap-2">
          <Input value={value} onChange={(e) => setValue(e.target.value)} />
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function SpecDefinitionCell({ row }: Props) {
  const [open, setOpen] = useState(false);
  const { specDefinition, id } = row.original;
  const [value, setValue] = useState(specDefinition);
  const router = useRouter();
  const { mutateAsync } = api.labelClass.update.useMutation();

  const handleSubmit = async () => {
    if (!value) return;

    toast.info("Updating spec definition...");
    await mutateAsync({ id, specDefinition: value });
    toast.success("Spec definition updated!");
    setOpen(false);
    router.refresh();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <div className="flex items-center gap-1 ">
          <p className="whitespace-pre-wrap text-start">{specDefinition}</p>
          <Pencil className="size-3" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="h-[400px] w-[800px]">
        <form action={handleSubmit} className="flex h-full items-center gap-2">
          <Textarea
            value={value ?? ""}
            onChange={(e) => setValue(e.target.value)}
            className="h-full"
          />
          <Button size="sm">Save</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function RunLLMCell({ row }: Props) {
  const { id, displayName, imageStoreId, specDefinition } = row.original;
  const router = useRouter();
  const { mutateAsync } = api.ai.runLLM.useMutation();
  const { data: referenceImages } =
    api.referenceImage.getByLabelClassId.useQuery({
      labelClassId: id,
    });

  if (!referenceImages || !specDefinition) return <></>;

  const handleClick = async () => {
    toast.info("started LLM-Experiment");
    await mutateAsync({
      imageStoreId,
      labelClassId: id,
      labelClassDisplayName: displayName,
      specDefinition: specDefinition,
      referenceImages: referenceImages
        .filter((ri) => ri.description)
        .map((ri) => ({
          url: ri.url,
          description: ri.description!,
          isPositive: ri.isPositive,
        })),
    });
    toast.success("LLM-Experiment finished!");
    router.push("llm-playground");
  };

  return (
    <Button size="icon" onClick={handleClick} variant="ghost">
      <Bot className="size-4" />
    </Button>
  );
}

function HumanCountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getHumanCount.useQuery({ id });
  return <>{data}</>;
}

function AICountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getAICount.useQuery({ id });
  return <>{data}</>;
}

function MultiHumanCountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getMultiHumanCount.useQuery({ id });
  return <>{data}</>;
}

function MultiAiCountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getMultiAiCount.useQuery({ id });
  return <>{data}</>;
}

function DetHumanCountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getDetHumanCount.useQuery({ id });
  return <>{data}</>;
}

function DetAiCountCell({ row }: Props) {
  const { id } = row.original;
  const { data } = api.labelClass.getDetAiCount.useQuery({ id });
  return <>{data}</>;
}
