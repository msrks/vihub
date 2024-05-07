"use client";

import { api } from "@/trpc/react";
import { Bot, Check, Download, ImageIcon, Trash2, User } from "lucide-react";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/server/api/root";
import { Badge } from "./ui/badge";
import { formatDate } from "date-fns";
import { AspectRatio } from "./ui/aspect-ratio";
import { ZoomDialog } from "./image/zoom-dialog";

export function ImageItem({
  image,
  handleImageClick,
  isChecked,
  setAsQueryImage,
  score,
  aspectRatio = 200 / 150,
  colWidth = 200,
  resultLabel,
}: {
  image: RouterOutputs["image"]["getInfiniteByImageStoreId"]["items"][number];
  handleImageClick?: (imageId: number) => void;
  isChecked?: boolean;
  setAsQueryImage?: (url: string) => void;
  score?: number;
  aspectRatio?: number;
  colWidth?: number;
  resultLabel?: RouterOutputs["labelClass"]["getAll"][number];
}) {
  const utils = api.useUtils();
  const { mutateAsync: delImage } = api.image.deleteById.useMutation();
  const { mutateAsync: setThumb } = api.imageStore.setThumbnail.useMutation();
  const { mutateAsync: setAsExp } = api.image.update.useMutation();
  const { data: multiAILabels } =
    api.multiClassAiPrediction.getByImageId.useQuery({
      imageId: image.id,
    });
  const { data: multiLabels } = api.image.getMultiLabels.useQuery({
    imageId: image.id,
  });
  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId: image.imageStoreId,
  });

  const handleDelete = async () => {
    toast.info("Deleting image...");
    await delImage({ id: image.id });
    toast.success("Image deleted");
    await utils.image.invalidate();
  };

  const handleSetThumbnail = async () => {
    toast.info("Setting as thumbnail...");
    await setThumb({ id: image.imageStoreId, thumbnailUrl: image.url });
    toast.success("Thumbnail set");
    await utils.imageStore.invalidate();
  };

  const handleSelectForExperiment = async () => {
    toast.info("Toggling LLM-experiment-use ...");
    await setAsExp({
      id: image.id,
      selectedForExperiment: !image.selectedForExperiment,
    });
    toast.success("LLM-experiment-use toggled");
    await utils.image.invalidate();
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer overflow-hidden text-center outline-2 outline-primary hover:outline",
        {
          "w-[300px]": colWidth === 300,
          "w-[400px]": colWidth === 400,
          "w-[200px]": colWidth !== 300 && colWidth !== 400,
        },
      )}
      onClick={() => handleImageClick?.(image.id)}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <AspectRatio ratio={aspectRatio} className="relative bg-muted">
            <Image
              src={image.url}
              alt=""
              fill
              className="rounded-md object-cover"
            />
            {isChecked && <Check className="absolute size-5 bg-secondary" />}
            <div className="absolute bottom-6 right-0 flex flex-row-reverse">
              {!resultLabel &&
                labelClasses
                  ?.filter((lc) => lc.id === image.humanLabelId)
                  .map((lc) => (
                    <Badge key={lc.id} style={{ backgroundColor: lc.color }}>
                      <User className="mr-1 size-3" /> {lc.displayName}
                    </Badge>
                  ))}
              {resultLabel && (
                <Badge
                  key={resultLabel.id}
                  style={{ backgroundColor: resultLabel.color }}
                >
                  <User className="mr-1 size-3" /> {resultLabel.displayName}
                </Badge>
              )}
              {multiLabels?.map(({ key, color, displayName }) => (
                <Badge key={key} style={{ backgroundColor: color }}>
                  {displayName ?? key}
                </Badge>
              ))}
            </div>
            <div className="absolute bottom-0 right-0 flex flex-row-reverse">
              {labelClasses
                ?.filter((lc) => lc.id === image.aiLabelId)
                .map((lc) => (
                  <Badge key={lc.id} style={{ backgroundColor: lc.color }}>
                    <User className="mr-1 size-3" /> {lc.displayName}{" "}
                    {image.aiLabelDetail?.confidence?.toFixed(2)}
                  </Badge>
                ))}
              {multiAILabels?.map(
                ({ multi_class_ai_prediction, label_class }) => {
                  return (
                    <Badge
                      key={multi_class_ai_prediction.id}
                      style={{ backgroundColor: label_class.color }}
                    >
                      {label_class.displayName}{" "}
                      {multi_class_ai_prediction.confidence.toFixed(2)}
                    </Badge>
                  );
                },
              )}
            </div>

            {score && (
              <Badge className="absolute right-0 top-0" variant="secondary">
                Score: {score.toFixed(2)}
              </Badge>
            )}
            {multiLabels && (
              <ZoomDialog
                image={image}
                ratio={aspectRatio}
                multiLabels={multiLabels}
              />
            )}
            {!resultLabel && image.selectedForExperiment && (
              <Badge className="absolute bottom-0 left-0">
                <Bot className="mr-1 size-3" /> Test
              </Badge>
            )}
          </AspectRatio>

          <p className="text-xs">
            {formatDate(image.createdAt, "yyyy-MM-dd HH:mm:ss")}
          </p>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {!resultLabel && (
            <ContextMenuItem onClick={() => setAsQueryImage?.(image.url)}>
              <ImageIcon className="mr-2 size-4" />
              Set as queryImage
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleDelete}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </ContextMenuItem>
          <a href={image.downloadUrl}>
            <ContextMenuItem>
              <Download className="mr-2 size-4" />
              Download
            </ContextMenuItem>
          </a>
          <ContextMenuItem onClick={handleSetThumbnail}>
            <ImageIcon className="mr-2 size-4" />
            Set as thumbnail
          </ContextMenuItem>
          {!resultLabel && (
            <ContextMenuItem onClick={handleSelectForExperiment}>
              <Bot className="mr-2 size-4" />
              Toggle LLM-experiment-use
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
