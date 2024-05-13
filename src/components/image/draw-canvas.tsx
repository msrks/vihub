"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { api } from "@/trpc/react";

import { DataTable } from "../data-table";
import { Button } from "../ui/button";

import type { RouterOutputs } from "@/server/api/root";
import type { MouseEvent } from "react";

const W_DEFAULT = 400;
const minOf = (a: number, b: number) => (a < b ? a : b);
const maxOf = (a: number, b: number) => (a > b ? a : b);

export function DrawCanvas({
  image,
  labelClasses,
}: {
  image: RouterOutputs["image"]["getInfiniteByImageStoreId"]["items"][number];
  labelClasses: RouterOutputs["labelClass"]["getAll"];
}) {
  const utils = api.useUtils();
  const { data: labels } = api.labelDet.getAllByImageId.useQuery({
    imageId: image.id,
  });
  const { mutateAsync: createLabel } = api.labelDet.create.useMutation();
  const { mutateAsync: deleteLabel } = api.labelDet.deleteById.useMutation();

  const handleDelete = async (id: number) => {
    toast.info("Deleting...");
    await deleteLabel({ id });
    await utils.labelDet.getAllByImageId.invalidate({ imageId: image.id });
    toast.success("Deleted");
  };

  const fixedCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D>();

  const [isDrawing, setIsDrawing] = useState(false);
  const [labelTag, setLabelTag] = useState("");

  const startX = useRef(0);
  const startY = useRef(0);
  const endX = useRef(0);
  const endY = useRef(0);

  const clearCanvas = (ctx?: CanvasRenderingContext2D) => {
    ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
  };

  const drawBBox = useCallback(
    (ctx?: CanvasRenderingContext2D) => {
      if (!labelClasses || !ctx) return;
      labels?.forEach((l) => {
        ctx.strokeStyle = labelClasses.find(
          (lc) => lc.id === l.labelClassId,
        )!.color;
        ctx.setLineDash(l.type === "human" ? [] : [3, 5]);
        const x = (l.xMin * W_DEFAULT) / image.width;
        const y = (l.yMin * W_DEFAULT) / image.width;
        const w = ((l.xMax - l.xMin) * W_DEFAULT) / image.width;
        const h = ((l.yMax - l.yMin) * W_DEFAULT) / image.width;
        ctx.strokeRect(x, y, w, h);
      });
    },
    [labels, labelClasses, image],
  );

  useEffect(() => {
    const ctx = fixedCanvasRef.current!.getContext("2d")!;
    ctx.lineWidth = 2;
    clearCanvas(ctx);
    drawBBox(ctx);
    clearCanvas(ctxRef.current);
  }, [labels, drawBBox]);

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    ctxRef.current = ctx;
  }, [labelTag, labelClasses]);

  const drawRectangle = (e: MouseEvent) => {
    if (!isDrawing || !labelTag) return;
    const offset = canvasRef.current!.getBoundingClientRect();
    endX.current = e.clientX - offset.left;
    endY.current = e.clientY - offset.top;
    const w = endX.current - startX.current;
    const h = endY.current - startY.current;
    clearCanvas(ctxRef.current);
    // drawBBox();
    ctxRef.current!.strokeRect(startX.current, startY.current, w, h);
  };

  const startDrawing = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const offset = canvasRef.current!.getBoundingClientRect();
    startX.current = e.clientX - offset.left;
    startY.current = e.clientY - offset.top;
    setIsDrawing(true);
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const scale = image.width / W_DEFAULT;
    const xMin = Math.round(scale * minOf(startX.current, endX.current));
    const yMin = Math.round(scale * minOf(startY.current, endY.current));
    const xMax = Math.round(scale * maxOf(startX.current, endX.current));
    const yMax = Math.round(scale * maxOf(startY.current, endY.current));

    toast.info("Adding New Label ...");
    await createLabel({
      type: "human",
      imageId: image.id,
      labelClassId: labelClasses.find((l) => l.key === labelTag)!.id,
      xMin,
      yMin,
      xMax,
      yMax,
    });
    toast.success("Label Added");
    await utils.labelDet.getAllByImageId.invalidate({ imageId: image.id });
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative">
        <Image
          src={image.url}
          width={W_DEFAULT}
          height={(W_DEFAULT * image.height) / image.width}
          alt=""
        />
        <canvas
          ref={fixedCanvasRef}
          width={W_DEFAULT}
          height={(W_DEFAULT * image.height) / image.width}
          className="absolute inset-0 rounded-md border bg-transparent"
        />
        <canvas
          ref={canvasRef}
          width={W_DEFAULT}
          height={(W_DEFAULT * image.height) / image.width}
          className="absolute inset-0 rounded-md border bg-transparent"
          style={{
            borderColor:
              labelClasses.find((l) => l.key === labelTag)?.color ?? "black",
          }}
          onMouseDown={startDrawing}
          onMouseMove={drawRectangle}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="mt-2 flex w-full justify-center gap-4">
        <ToggleGroup
          type="single"
          value={labelTag}
          onValueChange={(val) => {
            val && setLabelTag(val);
            ctxRef.current!.strokeStyle =
              labelClasses.find((l) => l.key === val)?.color ?? "#555555";
          }}
        >
          {labelClasses.map((l) => (
            <ToggleGroupItem
              key={l.id}
              value={l.key}
              className="flex items-center gap-1"
            >
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              {l.displayName}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <DataTable
        data={labels?.filter((l) => l.type === "human") ?? []}
        columns={[
          { header: "type", accessorKey: "type" },
          {
            header: "label",
            cell: ({ row }) => (
              <>
                {labelClasses
                  .filter((lc) => row.original.labelClassId === lc.id)
                  .map((lc) => (
                    <div className="flex items-center gap-1" key={lc.id}>
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: lc.color }}
                      />
                      {lc.displayName}
                    </div>
                  ))}
              </>
            ),
          },
          { header: "xMin", accessorKey: "xMin" },
          { header: "yMin", accessorKey: "yMin" },
          { header: "xMax", accessorKey: "xMax" },
          { header: "yMax", accessorKey: "yMax" },
          {
            header: "delete",
            cell: ({ row }) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="size-3" />
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
