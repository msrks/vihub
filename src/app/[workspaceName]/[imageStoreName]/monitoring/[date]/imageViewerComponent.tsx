"use client";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

export function ImageViewerComponent({
  imageStoreId,
  date,
  handleImageClick,
}: {
  imageStoreId: number;
  date?: string;
  handleImageClick?: (url: string) => void;
}) {
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

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {data?.pages.flatMap((page) =>
          page.items.map((image) => (
            <div
              key={image.id}
              className="relative h-[150px] w-[200px] overflow-hidden"
              onClick={() => handleImageClick?.(image.url)}
            >
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
