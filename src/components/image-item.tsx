"use client";

import { api } from "@/trpc/react";
import {
  Bot,
  Check,
  Download,
  ImageIcon,
  Trash2,
  User,
  ZoomIn,
} from "lucide-react";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LabelClass } from "@/app/[workspaceName]/[imageStoreName]/spec-catalog/_components/columns";
import type { RouterOutputs } from "@/server/api/root";
import { Badge } from "./ui/badge";
import { formatDate } from "date-fns";
import { AspectRatio } from "./ui/aspect-ratio";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

type TImage =
  RouterOutputs["image"]["getInfiniteByImageStoreId"]["items"][number];

export function ImageItem({
  image,
  handleImageClick,
  isChecked,
  humanLabelClass,
  aiLabelClass,
  aiLabelConfidence,
  setAsQueryImage,
  imageStoreId,
  score,
  isResultView,
  aspectWidth = 200,
  aspectHeight = 150,
  colWidth = 200,
}: {
  image: TImage;
  handleImageClick: (imageId: number) => void;
  isChecked: boolean;
  humanLabelClass?: LabelClass;
  aiLabelClass?: LabelClass;
  aiLabelConfidence?: number;
  setAsQueryImage?: (url: string) => void;
  imageStoreId: number;
  score?: number;
  isResultView?: boolean;
  aspectWidth?: number;
  aspectHeight?: number;
  colWidth?: number;
}) {
  const utils = api.useUtils();
  const { mutateAsync: deleteImage } = api.image.deleteById.useMutation();
  const { mutateAsync: setThumbnail } =
    api.imageStore.setThumbnail.useMutation();
  const { mutateAsync: setExperimentUse } = api.image.update.useMutation();

  const handleDelete = async () => {
    toast.info("Deleting image...");
    await deleteImage({ id: image.id });
    toast.success("Image deleted");
    await utils.image.invalidate();
  };

  const handleSetThumbnail = async () => {
    toast.info("Setting as thumbnail...");
    await setThumbnail({
      id: imageStoreId,
      thumbnailUrl: image.url,
    });
    toast.success("Thumbnail set");
    await utils.imageStore.invalidate();
  };

  const handleSelectForExperiment = async () => {
    toast.info("Toggling LLM-experiment-use ...");
    await setExperimentUse({
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
      onClick={() => handleImageClick(image.id)}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <AspectRatio
            ratio={aspectWidth / aspectHeight}
            className="relative bg-muted"
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="rounded-md object-cover"
            />
            {isChecked && <Check className="absolute size-5 bg-secondary" />}
            {humanLabelClass && (
              <Badge
                className="absolute bottom-6 right-0"
                style={{ backgroundColor: humanLabelClass.color ?? "" }}
              >
                <User className="mr-1 size-3" /> {humanLabelClass.key}
              </Badge>
            )}
            {aiLabelClass && (
              <Badge
                className="absolute bottom-0 right-0"
                style={{ backgroundColor: aiLabelClass.color ?? "" }}
              >
                <Bot className="mr-1 size-3" /> {aiLabelClass.key}{" "}
                {aiLabelConfidence?.toFixed(2)}
              </Badge>
            )}
            {score && (
              <Badge className="absolute right-0 top-0" variant="secondary">
                Score: {score.toFixed(2)}
              </Badge>
            )}
            <Dialog>
              <DialogTrigger>
                <ZoomIn className="absolute right-0 top-0 size-5 bg-secondary" />
              </DialogTrigger>
              <DialogContent className="max-w-6xl">
                <AspectRatio
                  ratio={aspectWidth / aspectHeight}
                  className="bg-muted"
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="rounded-md object-cover"
                  />
                </AspectRatio>
                {/* <DialogDescription></DialogDescription> */}
              </DialogContent>
            </Dialog>
            {!isResultView
              ? image.selectedForExperiment && (
                  <Badge className="absolute bottom-0 left-0">
                    <Bot className="mr-1 size-3" /> Test
                  </Badge>
                )
              : null}
          </AspectRatio>

          <p className="text-xs">
            {formatDate(image.createdAt, "yyyy-MM-dd HH:mm:ss")}
          </p>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {!isResultView && (
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
          {!isResultView && (
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
