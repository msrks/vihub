"use client";

import { format } from "date-fns";
import { LinkIcon, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { RouterOutputs } from "@/server/api/root";
import type { ColumnDef, Row } from "@tanstack/react-table";
type TrainingJob = RouterOutputs["trainingJob"]["getAll"][number];

export const columns: ColumnDef<TrainingJob>[] = [
  { header: "createdAt", cell: CreatedAt },
  // { header: "dataset", cell: ID },
  // { header: "eval", cell: ModelEval },
  // { header: "type", accessorKey: "type" },
  { header: "state", cell: State },
  // { header: "total", accessorKey: "numImages" },
  { header: "nTrain", accessorKey: "numTrain" },
  { header: "nTest", accessorKey: "numTest" },
  { header: "nValid", accessorKey: "numValid" },
  { header: "confMat", cell: ConfMat },
  { header: "mAP", cell: (v) => <>{v.row.original.auPrc?.toFixed(3)}</> },
  { header: "loss", cell: (v) => <>{v.row.original.logLoss?.toFixed(3)}</> },
  { header: "tflite", cell: (v) => <L l={v.row.original.urlTFlite} /> },
  { header: "tfjs", cell: (v) => <L l={v.row.original.urlTFJS} /> },
  { header: "savedModel", cell: (v) => <L l={v.row.original.urlSavedModel} /> },
  { header: "dateRange", accessorKey: "dateRange" },
  { header: "source", cell: (v) => <L l={v.row.original.importFilePath} /> },
];

function State({ row }: { row: Row<TrainingJob> }) {
  const { state } = row.original;
  return <>{state.replace("PIPELINE_STATE_", "").toLowerCase()}</>;
}

function ConfMat({ row }: { row: Row<TrainingJob> }) {
  const { confusionMatrix } = row.original;
  // return (
  //   <>
  //     {confusionMatrix?.annotationSpecs.length} <ZoomIn className="size-4" />
  //   </>
  // );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="link">
          <ZoomIn className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Table>
          <TableCaption>Confusion Matrix</TableCaption>

          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              {confusionMatrix?.annotationSpecs.map((a, i) => (
                <TableHead key={i}>{a.displayName}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {confusionMatrix?.rows?.map((r, i) => (
              <TableRow key={i}>
                <TableCell>
                  {
                    confusionMatrix.annotationSpecs.find((a, idx) => idx === i)
                      ?.displayName
                  }
                </TableCell>
                {r.values.map((v, j) => (
                  <TableCell key={j}>{v}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PopoverContent>
    </Popover>
  );
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
        href={`https://console.cloud.google.com/vertex-ai/locations/us-central1/models/${row.original.modelId}/versions/1/evaluations/${row.original.evalId}?project=dev-msrks`}
      >
        {/* {row.original.modelId} */}
        <ZoomIn className="size-3.5" />
      </a>
    </Button>
  );
}

function L({ l }: { l?: string | null }) {
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
