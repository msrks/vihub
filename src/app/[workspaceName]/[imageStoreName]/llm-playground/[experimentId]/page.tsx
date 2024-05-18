"use client";

import { Bot, Loader2 } from "lucide-react";

import { DataTable } from "@/components/data-table";
import { ImageItem } from "@/components/image-item";
import { Badge } from "@/components/ui/badge";
import { api } from "@/trpc/react";

import { columns } from "../_components/columns";

import type { RouterOutputs } from "@/server/api/root";

type Experiment = RouterOutputs["promptingExperiment"]["getById"];

function ExampleListView({
  experiment,
  onlyPositive = false,
}: {
  experiment: Experiment;
  onlyPositive?: boolean;
}) {
  const { data: experimentResults } =
    api.experimentResult.getAllByExperimentId.useQuery({
      experimentId: experiment.prompting_experiment.id,
    });

  if (!experimentResults) return null;

  return (
    <div className="w-full">
      <h2 className="my-2 text-2xl font-semibold tracking-tight">
        {onlyPositive ? "Positive" : "Negative"} Images
      </h2>
      <div className="flex flex-wrap gap-2">
        {experimentResults
          .filter(
            (result) =>
              result.experiment_result.isPositiveExample === onlyPositive,
          )
          .map((result) => (
            <div
              className="flex flex-col items-center justify-start gap-1"
              key={result.experiment_result.id}
            >
              <ImageItem
                image={result.image}
                resultLabel={result.label_class}
              />
              <p className="w-[200px] text-xs">
                {result.experiment_result.predLabel ? (
                  <Badge
                    className="mr-0.5 border-0 px-1 py-0"
                    style={{
                      backgroundColor: experiment.label_class.color,
                    }}
                  >
                    <Bot className="mr-0.5 size-3" />
                    {experiment.label_class.displayName}
                  </Badge>
                ) : (
                  <Badge
                    className="mr-0.5 border-0 px-1 py-0"
                    variant="secondary"
                  >
                    <Bot className="mr-0.5 size-3" />
                    not {experiment.label_class.displayName}
                  </Badge>
                )}
                {result.experiment_result.predReason}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function Page({
  params: { experimentId },
}: {
  params: {
    workspaceName: string;
    imageStoreName: string;
    experimentId: string;
  };
}) {
  const { data: experiment, isLoading } =
    api.promptingExperiment.getById.useQuery({
      id: parseInt(experimentId),
    });

  if (!experiment) return null;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {experiment && <DataTable columns={columns} data={[experiment]} />}
      </div>
      {experiment && <ExampleListView experiment={experiment} onlyPositive />}
      {experiment && <ExampleListView experiment={experiment} />}
    </div>
  );
}
