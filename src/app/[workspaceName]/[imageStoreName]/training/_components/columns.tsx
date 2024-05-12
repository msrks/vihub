"use client";

import { format } from "date-fns";
import { LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { RouterOutputs } from "@/server/api/root";
import type { ColumnDef, Row } from "@tanstack/react-table";

type TrainingJob = RouterOutputs["trainingJob"]["getAll"][number];

export const columns: ColumnDef<TrainingJob>[] = [
  { header: "ID", cell: ID },
  { header: "type", accessorKey: "type" },
  { header: "state", cell: State },
  { header: "numImgs", accessorKey: "numImages" },
  { header: "vertexAI", cell: ModelEval },
  { header: "fList", cell: ({ row }) => <L l={row.original.importFilePath} /> },
  { header: "tflite", cell: ({ row }) => <L l={row.original.urlTFlite} /> },
  { header: "tfSM", cell: ({ row }) => <L l={row.original.urlSavedModel} /> },
  { header: "tfjs", cell: ({ row }) => <L l={row.original.urlTFJS} /> },
  { header: "mAP", accessorKey: "mAP" },
  { header: "dateRange", accessorKey: "dateRange" },
  { header: "createdAt", cell: CreatedAt },
];

function State({ row }: { row: Row<TrainingJob> }) {
  const { state } = row.original;
  return <>{state.replace("PIPELINE_STATE_", "").toLowerCase()}</>;
}

function ID({ row }: { row: Row<TrainingJob> }) {
  return (
    <Button variant="link" className="p-0" asChild>
      <a
        target="_blank"
        href={`https://console.cloud.google.com/vertex-ai/locations/us-central1/datasets/${row.original.datasetId}/browse?project=dev-msrks`}
      >
        {row.original.id}
      </a>
    </Button>
  );
}

function ModelEval({ row }: { row: Row<TrainingJob> }) {
  return (
    <Button variant="link" className="p-0" asChild>
      <a
        target="_blank"
        href={`https://console.cloud.google.com/vertex-ai/locations/us-central1/models/${row.modelId}/versions/1/evaluations/${row.evalId}?project=${process.env.NEXT_PUBLIC_PROJECT_ID}`}
      >
        {row.original.modelId}
      </a>
    </Button>
  );
}

function L({ l }: { l?: string }) {
  if (!l) return null;
  return (
    <Button variant="link" asChild className="p-0">
      <a
        target="_blank"
        href={l.replace("gs://", "https://storage.cloud.google.com/")}
      >
        <LinkIcon className="size-3.5" />
      </a>
    </Button>
  );
}

function CreatedAt({ row }: { row: Row<TrainingJob> }) {
  const { createdAt } = row.original;
  return <span>{format(new Date(createdAt), "yy/MM/dd HH:mm")}</span>;
}
