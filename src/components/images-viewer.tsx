"use client";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ImageItem } from "./image-item";

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
            <ImageItem
              key={image.id}
              image={image}
              handleImageClick={handleImageClick}
              isChecked={selectedImages.includes(image.id)}
              labelClass={labelClasses?.find(
                (lc) => lc.id === image.humanLabelId,
              )}
              setAsQueryImage={setAsQueryImage}
              imageStoreId={imageStoreId}
            />
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
