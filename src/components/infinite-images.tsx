"use client";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import type { RouterOutputs } from "@/server/api/root";

// type SearchResults = Awaited<ReturnType<typeof searchImages>>;
type SearchResult = RouterOutputs["ai"]["searchImages"][number];

export function InfiniteImages({
  imageStoreId,
  date,
  onlyLabeled = false,
  onlyUnlabeled = false,
}: {
  imageStoreId: number;
  date?: string;
  onlyLabeled?: boolean;
  onlyUnlabeled?: boolean;
}) {
  const utils = api.useUtils();
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [queryImage, setQueryImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [queryText] = useDebounce(text, 1000);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { mutateAsync: searchImages } = api.ai.searchImages.useMutation();

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    api.image.getInfiniteByImageStoreId.useInfiniteQuery(
      { imageStoreId, limit: 10, date, onlyLabeled, onlyUnlabeled },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const setAsQueryImage = async (url: string) => {
    setText("");
    setQueryImage(url);
    setIsSearching(true);
    const results = await searchImages({
      queryText: url,
      namespace: imageStoreId.toString(),
    });
    setIsSearching(false);
    setSearchResults(results);
  };

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

  const handleSubmit = async () => {
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
  };

  useEffect(() => {
    const searchByText = async () => {
      setQueryImage(null);
      setIsSearching(true);
      const results = await searchImages({
        queryText,
        namespace: imageStoreId.toString(),
      });
      setIsSearching(false);
      setSearchResults(results);
    };

    queryText && void searchByText();
  }, [imageStoreId, queryText, searchImages]);

  return (
    <div className="flex w-full grow flex-col items-center gap-2">
      {selectedImages.length > 0 ? (
        <div className="mr-12 flex w-full items-center justify-end gap-4">
          <p>{selectedImages.length} images selected</p>
          <form className="flex items-center gap-2" action={handleSubmit}>
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
        <div className="flex w-full items-center justify-around px-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="queryText">queryText</Label>
            <Input
              type="text"
              id="queryText"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="queryImage">queryImage</Label>
            {queryImage ? (
              <div className="relative h-[90px] w-[120px] overflow-hidden">
                <Image
                  src={queryImage}
                  alt=""
                  fill
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  sizes="120px"
                />
              </div>
            ) : (
              <div className="flex h-[90px] w-[120px] items-center justify-center border border-muted p-2 text-center">
                <p>try to right-click image</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isSearching && <Loader2 className="mx-auto size-8 animate-spin" />}
      {!isSearching && searchResults.length === 0 && (
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
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {searchResults.map(({ image, score }) =>
            image ? (
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
                score={score}
              />
            ) : null,
          )}
        </div>
      )}

      {(isFetching || isFetchingNextPage) && (
        <Loader2 className="mx-auto size-8 animate-spin" />
      )}
    </div>
  );
}
