"use client";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";
import { Download, ImageIcon, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { toast } from "sonner";

export function ImageViewerComponent({
  imageStoreId,
  date,
  setAsQueryImage,
}: {
  imageStoreId: number;
  date?: string;
  setAsQueryImage?: (url: string) => void;
}) {
  const utils = api.useUtils();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    api.image.getInfiniteByImageStoreId.useInfiniteQuery(
      { imageStoreId, limit: 3, date },
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

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {data?.pages.flatMap((page) =>
          page.items.map((image) => (
            <div
              key={image.id}
              className="relative h-[150px] w-[200px] overflow-hidden"
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
