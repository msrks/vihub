"use client";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";
import { Check, Download, ImageIcon, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import type { LabelClass } from "@/app/[workspaceName]/[imageStoreName]/classes/_components/columns";

function LabelBadge({ labelClass }: { labelClass: LabelClass }) {
  return (
    <Badge
      className="absolute bottom-0 right-0"
      style={{ backgroundColor: labelClass.color ?? "" }}
    >
      {labelClass.key}
    </Badge>
  );
}

export function ImageViewerComponent({
  imageStoreId,
  date,
  setAsQueryImage,
  onlyLabeled = false,
  onlyUnlabeled = false,
}: {
  imageStoreId: number;
  date?: string;
  setAsQueryImage?: (url: string) => void;
  onlyLabeled?: boolean;
  onlyUnlabeled?: boolean;
}) {
  const utils = api.useUtils();
  const [selectedImages, setSelectedImages] = useState<number[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    api.image.getInfiniteByImageStoreId.useInfiniteQuery(
      { imageStoreId, limit: 10, date, onlyLabeled, onlyUnlabeled },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const lastImageRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastImageRef.current,
    threshold: 0.0,
  });

  if (hasNextPage && entry?.isIntersecting) void fetchNextPage();

  const { mutateAsync: deleteImage } = api.image.deleteById.useMutation();

  const { mutateAsync: setThumbnail } =
    api.imageStore.setThumbnail.useMutation();

  const handleImageClick = (imageId: number) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages((prev) => prev.filter((id) => id !== imageId));
    } else {
      setSelectedImages((prev) => [...prev, imageId]);
    }
  };

  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId,
  });
  const { mutateAsync: updateImage } = api.image.update.useMutation();
  const [labelClass, setLabelClass] = useState<string | undefined>(undefined);

  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      {selectedImages.length > 0 ? (
        <div className="mr-12 flex w-full items-center justify-end gap-4">
          <p>{selectedImages.length} images selected</p>
          <form
            className="flex items-center gap-2"
            action={async () => {
              if (!labelClass) return toast.error("Please select a class");

              toast.info("Setting as labeled...");
              await Promise.all(
                selectedImages.map((id) =>
                  updateImage({ id, humanLabelId: parseInt(labelClass) }),
                ),
              );
              toast.success("Images labeled");
              setSelectedImages([]);
              setLabelClass(undefined);
              await utils.image.invalidate();
            }}
          >
            <Select
              required
              value={labelClass}
              onValueChange={(value) => setLabelClass(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder=" -- class -- " />
              </SelectTrigger>
              <SelectContent>
                {labelClasses?.map((lc) => (
                  <SelectItem key={lc.id} value={lc.id.toString()}>
                    {lc.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!labelClass}>Assign ClassLabel</Button>
          </form>
        </div>
      ) : (
        <div className="mr-12 h-[36px] self-end">
          Select images to do some actions
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {data?.pages.flatMap((page) =>
          page.items.map((image) => (
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
                    style={{
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                    sizes="200px"
                  />
                  {selectedImages.includes(image.id) && (
                    <div className="absolute bg-primary">
                      <Check className="size-5" />
                    </div>
                  )}
                  {labelClasses && image.humanLabelId && (
                    <LabelBadge
                      labelClass={
                        labelClasses.find((lc) => lc.id === image.humanLabelId)!
                      }
                    />
                  )}
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => setAsQueryImage?.(image.url)}>
                    <ImageIcon className="mr-2 size-4" />
                    Set as queryImage
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={async () => {
                      toast.info("Deleting image...");
                      await deleteImage({ id: image.id });
                      toast.success("Image deleted");
                      await utils.image.invalidate();
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </ContextMenuItem>
                  <a href={image.downloadUrl}>
                    <ContextMenuItem>
                      <Download className="mr-2 size-4" />
                      Download
                    </ContextMenuItem>
                  </a>
                  <ContextMenuItem
                    onClick={async () => {
                      toast.info("Setting as thumbnail...");
                      await setThumbnail({
                        id: imageStoreId,
                        thumbnailUrl: image.url,
                      });
                      toast.success("Thumbnail set");
                      await utils.imageStore.invalidate();
                    }}
                  >
                    <ImageIcon className="mr-2 size-4" />
                    Set as thumbnail
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          )),
        )}
        <div ref={ref} className="-ml-3 h-1 w-1"></div>
      </div>

      {(isFetching || isFetchingNextPage) && (
        <Loader2 className="mx-auto size-8 animate-spin" />
      )}
    </div>
  );
}
