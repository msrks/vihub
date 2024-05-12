"use client";

import { format } from "date-fns";
import { LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { RouterOutputs } from "@/server/api/root";
import type { ColumnDef } from "@tanstack/react-table";

type TrainingJob = RouterOutputs["trainingJob"]["getAll"][number];

export const columns: ColumnDef<TrainingJob>[] = [
  {
    header: "ID",
    cell: ({ row }) => (
      <Button variant="link" asChild>
        <a
          target="_blank"
          href={`https://console.cloud.google.com/vertex-ai/locations/us-central1/datasets/${row.original.vertexAiDatasetId}/browse?project=dev-msrks`}
        >
          {row.original.id}
        </a>
      </Button>
    ),
  },
  { header: "Type", accessorKey: "type" },
  { header: "Status", accessorKey: "status" },
  { header: "NumImages", accessorKey: "numImages" },
  {
    header: "ImportFile",
    cell: ({ row }) => (
      <Button variant="link" asChild>
        <a
          target="_blank"
          href={row.original.gcsDatasetFilePath.replace(
            "gs://",
            "https://storage.cloud.google.com/",
          )}
        >
          <LinkIcon className="size-3.5" />
        </a>
      </Button>
    ),
  },
  { header: "mAP", accessorKey: "mAP" },
  { header: "dateRange", accessorKey: "dateRange" },
  {
    header: "Created At",
    cell: ({ row }) => (
      <span>{format(new Date(row.original.createdAt), "yy/MM/dd HH:mm")}</span>
    ),
  },
];
