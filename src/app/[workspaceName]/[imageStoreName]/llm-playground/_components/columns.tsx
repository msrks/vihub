"use client";

import type { RouterOutputs } from "@/server/api/root";
import type { Row, ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";

export type PromptingExperiment =
  RouterOutputs["promptingExperiment"]["getAll"][number];

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

function CreatedAtCell({
  row: {
    original: {
      prompting_experiment: { createdAt },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return <span>{new Date(createdAt).toLocaleString()}</span>;
}

function ScorePositiveCell({
  row: {
    original: {
      prompting_experiment: { id, scorePositive },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return (
    <Button variant="link">
      <Link href={`llm-playground/${id}`}>{scorePositive}</Link>
    </Button>
  );
}

function ScoreNegativeCell({
  row: {
    original: {
      prompting_experiment: { id, scoreNegative },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return (
    <Button variant="link">
      <Link href={`llm-playground/${id}`}>{scoreNegative}</Link>
    </Button>
  );
}

function ReferenceIamgesCell({
  row: {
    original: {
      prompting_experiment: { referenceImages },
    },
  },
}: {
  row: Row<PromptingExperiment>;
}) {
  return (
    <div className="flex gap-1">
      {referenceImages.map((image, i) => (
        <Dialog key={i}>
          <DialogTrigger>
            <Image
              src={image.url}
              alt="thumbnail image"
              className="size-10"
              width={40}
              height={40}
            />
          </DialogTrigger>
          <DialogContent>
            <AspectRatio ratio={16 / 16} className="bg-muted">
              <Image
                src={image.url}
                alt=""
                fill
                className="rounded-md object-cover"
              />
            </AspectRatio>
            <DialogDescription>
              <Badge className="mr-2">
                {image.isPositive ? "Positive" : "Negative"}
              </Badge>
              {image.description}
            </DialogDescription>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

export const columns: ColumnDef<PromptingExperiment>[] = [
  { header: "Class", cell: ClassCell },
  { header: "Prompt", accessorKey: "prompting_experiment.specDefinition" },
  { header: "referenceImages", cell: ReferenceIamgesCell },
  { header: "Created At", cell: CreatedAtCell },
  { header: "Score (Positive)", cell: ScorePositiveCell },
  { header: "Score (Negative)", cell: ScoreNegativeCell },
];
