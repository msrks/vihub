"use client";

import { ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@/trpc/react";

import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ScrollArea } from "../ui/scroll-area";
import { DrawCanvas } from "./draw-canvas";

import type { RouterOutputs } from "@/server/api/root";

export function ZoomDialog({
  image,
  multiLabels,
  ratio,
}: {
  image: RouterOutputs["image"]["getInfiniteByImageStoreId"]["items"][number];
  multiLabels?: RouterOutputs["image"]["getMultiLabels"];
  ratio: number;
}) {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const [labelId, setLabelId] = useState(image.humanLabelId?.toString());
  const [multiLabelIds, setItems] = useState(
    multiLabels?.map((m) => m.id) ?? [],
  );
  const { data: labelList } = api.labelClass.getAll.useQuery({
    imageStoreId: image.imageStoreId,
  });

  const { data: imageStore } = api.imageStore.getById.useQuery({
    id: image.imageStoreId,
  });

  const { mutateAsync } = api.image.update.useMutation();

  const handleClick = async () => {
    toast.info("Updating labels...");
    await mutateAsync({
      id: image.id,
      humanLabelId: labelId ? parseInt(labelId) : undefined,
      multiLabelIds,
    });
    toast.success("Labels updated");
    await utils.image.invalidate();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <ZoomIn className="absolute right-0 top-0 size-5 bg-secondary" />
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[100vh] max-w-4xl flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <ScrollArea>
          {labelList && imageStore?.type === "det" && (
            <DrawCanvas
              image={image}
              labelClasses={labelList.filter((l) => l.isMultiClass)}
            />
          )}

          {imageStore?.type !== "det" && (
            <div className="grow overflow-hidden">
              <AspectRatio
                ratio={ratio}
                // TODO: need to refactor.. how to fix this?
                className="h-[calc(100vh-200px)]  bg-muted"
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="rounded-md object-contain"
                />
              </AspectRatio>
            </div>
          )}

          <div className="grid w-full grid-cols-2">
            {imageStore?.type === "clsS" && (
              <div className="col-span-1 flex flex-col gap-2">
                <DialogTitle>Single Label</DialogTitle>
                <RadioGroup
                  defaultValue={labelId}
                  onValueChange={(val) => setLabelId(val)}
                  className="flex items-center justify-center gap-4"
                >
                  {labelList
                    ?.filter((l) => !l.isMultiClass)
                    .map((l) => (
                      <div key={l.id} className="flex items-center gap-1">
                        <RadioGroupItem
                          value={l.id.toString()}
                          id={`r${l.id}`}
                        />
                        <Label htmlFor={`r${l.id}`}>{l.displayName}</Label>
                      </div>
                    ))}
                </RadioGroup>
              </div>
            )}

            {imageStore?.type === "clsM" && (
              <div className="col-span-1 flex flex-col gap-2">
                <DialogTitle>Multi Label</DialogTitle>
                <div className="flex items-center justify-center gap-4">
                  {labelList
                    ?.filter((l) => l.isMultiClass)
                    .map(({ id, key, displayName }) => (
                      <div key={id} className="flex items-center gap-1">
                        <Checkbox
                          id={key}
                          checked={multiLabelIds.includes(id)}
                          onCheckedChange={(checked) =>
                            checked
                              ? setItems([...multiLabelIds, id])
                              : setItems(
                                  multiLabelIds.filter((item) => item !== id),
                                )
                          }
                        />
                        <Label htmlFor={key}>{displayName ?? key}</Label>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          {["clsS", "clsM"].includes(imageStore?.type ?? "") && (
            <DialogFooter>
              <Button onClick={handleClick}>Save</Button>
            </DialogFooter>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
