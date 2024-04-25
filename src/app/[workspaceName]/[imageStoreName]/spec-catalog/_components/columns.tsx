"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { type ColorResult, TwitterPicker } from "react-color";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { Bot, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

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
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger asChild>
        <div
          className="size-3.5 rounded-full"
          style={{ backgroundColor: color ?? "#555555" }}
        />
      </PopoverTrigger>
      <PopoverContent>
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
      </PopoverContent>
    </Popover>
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
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <span className="flex items-center gap-1">
          {row.original.labelClasses.displayName} <Pencil className="size-3" />
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

function SpecDefinitionCell({ row }: { row: Row<LabelClassWithCount> }) {
  const [open, setOpen] = useState(false);
  const {
    labelClasses: { specDefinition, id },
  } = row.original;
  const [value, setValue] = useState(specDefinition);
  const utils = api.useUtils();
  const { mutateAsync } = api.labelClass.update.useMutation();

  const handleSubmit = async () => {
    if (!value) return;

    toast.info("Updating spec definition...");
    await mutateAsync({ id, specDefinition: value });
    toast.success("Spec definition updated!");
    setOpen(false);
    await utils.labelClass.invalidate();
  };

  return (
    <Popover open={open} onOpenChange={(e) => setOpen(e)}>
      <PopoverTrigger>
        <div className="flex items-center gap-1 ">
          <p className="whitespace-pre-wrap text-start">
            {row.original.labelClasses.specDefinition}
          </p>
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

function RunLLMCell({ row }: { row: Row<LabelClassWithCount> }) {
  const {
    labelClasses: { id, displayName, imageStoreId, specDefinition },
  } = row.original;
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

export const columns: ColumnDef<LabelClassWithCount>[] = [
  { header: "Color", cell: ColorCell },
  { header: "Key", accessorKey: "labelClasses.key" },
  { header: "Display Name", cell: DisplayNameCell },
  { header: "Count: HumanLabel", accessorKey: "humanCount" },
  { header: "Count: AILabel", accessorKey: "aiCount" },
  { header: "Spec Definition", cell: SpecDefinitionCell },
  { header: "Run LLM", cell: RunLLMCell },
];
