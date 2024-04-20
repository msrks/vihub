"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export const columns: ColumnDef<PromptingExperiment>[] = [
  { header: "Title", cell: TitleCell },
  { header: "Class", cell: ClassCell },
  { header: "Prompt", accessorKey: "prompting_experiment.specDefinition" },
  // TODO
  { header: "Score (Positive)", cell: () => <>4/5</> },
  { header: "Score (Negative)", cell: () => <>1/5</> },
];
