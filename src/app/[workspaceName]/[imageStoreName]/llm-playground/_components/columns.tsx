"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/trpc/react";

export type PromptingExperiment =
  RouterOutputs["promptingExperiment"]["getAll"][number];

function TitleCell({
  row: {
    original: {
      prompting_experiment: { title, id },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return (
    <Button variant="link">
      <Link href={`llm-playground/${id}`}>{title}</Link>
    </Button>
  );
}

function ClassCell({
  row: {
    original: {
      label_class: { color, displayName },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="size-3.5 rounded-full"
        style={{ backgroundColor: color ?? "#555555" }}
      />
      <span>{displayName}</span>
    </div>
  );
}

function ReferenceImagesCell({
  row: {
    original: {
      prompting_experiment: { id },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  const { data } = api.promptingExperimentReferenceImage.getAll.useQuery({
    promptingExperimentId: id,
  });
  return (
    <div className="flex gap-2">
      {data?.map((image) => (
        <Image
          key={image.id}
          src={image.url}
          width={40}
          height={40}
          className="h-10 w-10"
          alt={image.description ?? ""}
        />
      ))}
    </div>
  );
}

export const columns: ColumnDef<PromptingExperiment>[] = [
  { header: "Title", cell: TitleCell },
  { header: "Class", cell: ClassCell },
  { header: "Prompt", accessorKey: "prompting_experiment.specDefinition" },
  { header: "Reference Images", cell: ReferenceImagesCell },
  // TODO
  { header: "Score (Positive)", cell: () => <>4/5</> },
  { header: "Score (Negative)", cell: () => <>1/5</> },
];
