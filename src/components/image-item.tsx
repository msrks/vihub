"use client";

import { api } from "@/trpc/react";
import { Check, Download, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LabelClass } from "@/app/[workspaceName]/[imageStoreName]/classes/_components/columns";
import type { RouterOutputs } from "@/server/api/root";
import { Badge } from "./ui/badge";

type TImage =
  RouterOutputs["image"]["getInfiniteByImageStoreId"]["items"][number];

export function ImageItem({
  image,
  handleImageClick,
  isChecked,
  labelClass,
  setAsQueryImage,
  imageStoreId,
}: {
  image: TImage;
  handleImageClick: (imageId: number) => void;
  isChecked: boolean;
  labelClass?: LabelClass;
  setAsQueryImage?: (url: string) => void;
  imageStoreId: number;
}) {
  const utils = api.useUtils();
  const { mutateAsync: deleteImage } = api.image.deleteById.useMutation();
  const { mutateAsync: setThumbnail } =
    api.imageStore.setThumbnail.useMutation();

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

  return (
    <div
      key={image.id}
      className={cn(
        "relative h-[150px] w-[200px] cursor-pointer overflow-hidden outline-2 outline-primary hover:outline",
      )}
      onClick={() => handleImageClick(image.id)}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <Image
            src={image.url}
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            sizes="200px"
          />
          {isChecked && <Check className="absolute size-5 bg-primary" />}
          {labelClass && (
            <Badge
              className="absolute bottom-0 right-0"
              style={{ backgroundColor: labelClass.color ?? "" }}
            >
              {labelClass.key}
            </Badge>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setAsQueryImage?.(image.url)}>
            <ImageIcon className="mr-2 size-4" />
            Set as queryImage
          </ContextMenuItem>
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
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
