"use client";

import { Bot, Loader2, Save, Trash2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { api } from "@/trpc/react";
import { useIntersection } from "@mantine/hooks";

import { ImageItem } from "./image-item";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import type { RouterOutputs } from "@/server/api/root";
import type { FormEvent } from "react";

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
  const { data: imageStore } = api.imageStore.getById.useQuery({
    id: imageStoreId,
  });
  const utils = api.useUtils();
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [queryImage, setQueryImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [queryText] = useDebounce(text, 1000);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [aiLabelFilter, setAiLabelFilter] = useState("all");
  const [humanLabelFilter, setHumanLabelFilter] = useState("all");
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
  const { mutateAsync: deleteImage } = api.image.deleteById.useMutation();
  const { mutateAsync: toggleIsLabeled } =
    api.image.toggleIsLabeled.useMutation();
  const [labelClass, setLabelClass] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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

  const deleteAll = async () => {
    toast.info("Deleting all images...");
    await Promise.all(
      selectedImages.map(async (id) => {
        await deleteImage({ id });
      }),
    );
    toast.success("Images deleted");
    setSelectedImages([]);
    await utils.image.invalidate();
  };

  const toggleAll = async () => {
    toast.info("Updating isLabeledProperty...");
    await Promise.all(selectedImages.map((id) => toggleIsLabeled({ id })));
    toast.success("isLabeledProperty updated");
    setSelectedImages([]);
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

      <div className="mr-12 flex w-full items-center justify-end gap-4">
        <p>{selectedImages.length} images selected</p>
        <Button
          variant="outline"
          disabled={selectedImages.length === 0}
          size="sm"
          onClick={() => setSelectedImages([])}
        >
          Clear
        </Button>
      </div>
      <div className="mr-12 flex w-full items-center justify-end gap-4 ">
        {selectedImages.length > 0 && (
          <>
            <form className="flex items-center gap-2" onSubmit={handleSubmit}>
              <Label>SingleLabel</Label>
              <Select
                required
                value={labelClass}
                onValueChange={(value) => setLabelClass(value)}
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder=" -- class -- " />
                </SelectTrigger>
                <SelectContent>
                  {labelClasses
                    ?.filter((lc) => lc.type === "clsS")
                    .map((lc) => (
                      <SelectItem key={lc.id} value={lc.id.toString()}>
                        {lc.displayName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button size="sm" disabled={!labelClass}>
                <Save className="size-4" />
              </Button>
            </form>

            {onlyLabeled && (
              <Button size="sm" variant="secondary" onClick={toggleAll}>
                register as unlabeled
              </Button>
            )}
            {onlyUnlabeled && (
              <Button size="sm" variant="secondary" onClick={toggleAll}>
                move to dataset
              </Button>
            )}

            <Dialog>
              <DialogTrigger>
                <Button size="sm" variant="secondary">
                  <Trash2 className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Are you sure to permanently
                    delete these {selectedImages.length} images from our
                    servers?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={deleteAll}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="mr-12 flex w-full items-center justify-end gap-4">
        <RadioGroup
          defaultValue={humanLabelFilter}
          onValueChange={(val) => setHumanLabelFilter(val)}
          className="flex items-center"
        >
          <Label>
            <User className="inline size-4" />:{" "}
          </Label>
          <div className="flex items-center gap-1">
            <RadioGroupItem value="all" id="r1" />
            <Label htmlFor="r1">All</Label>
          </div>
          {labelClasses
            ?.filter((lc) => lc.type === "clsS")
            .map((lc) => (
              <div key={lc.id} className="flex items-center gap-1">
                <RadioGroupItem value={lc.id.toString()} id={`r${lc.id}`} />
                <Label htmlFor={`r${lc.id}`}>{lc.displayName}</Label>
              </div>
            ))}
        </RadioGroup>
      </div>

      <div className="mr-12 flex w-full items-center justify-end gap-4">
        <RadioGroup
          defaultValue={aiLabelFilter}
          onValueChange={(val) => setAiLabelFilter(val)}
          className="flex items-center"
        >
          <Label>
            <Bot className="inline size-4" />:{" "}
          </Label>
          <div className="flex items-center gap-1">
            <RadioGroupItem value="all" id="r1" />
            <Label htmlFor="r1">All</Label>
          </div>
          {labelClasses
            ?.filter((lc) => lc.type === "clsS")
            .map((lc) => (
              <div key={lc.id} className="flex items-center gap-1">
                <RadioGroupItem value={lc.id.toString()} id={`r${lc.id}`} />
                <Label htmlFor={`r${lc.id}`}>{lc.displayName}</Label>
              </div>
            ))}
        </RadioGroup>
      </div>

      {isSearching && <Loader2 className="mx-auto size-8 animate-spin" />}
      {imageStore && !isSearching && searchResults.length === 0 && (
        <div className="flex flex-wrap items-end justify-center gap-2">
          {data?.pages.flatMap((page) =>
            page.items
              .filter(
                (image) =>
                  humanLabelFilter === "all" ||
                  humanLabelFilter === image.humanLabelId?.toString(),
              )
              .filter(
                (image) =>
                  aiLabelFilter === "all" ||
                  aiLabelFilter === image.aiLabelId?.toString(),
              )
              .map((image) => (
                <ImageItem
                  key={image.id}
                  image={image}
                  handleImageClick={handleImageClick}
                  isChecked={selectedImages.includes(image.id)}
                  setAsQueryImage={setAsQueryImage}
                  colWidth={imageStore.colWidth}
                />
              )),
          )}
          <div ref={ref} className="-ml-3 h-1 w-1"></div>
        </div>
      )}
      {imageStore && !isSearching && searchResults.length > 0 && (
        <div className="flex flex-wrap items-end justify-center gap-2">
          {searchResults.map(({ image, score }) =>
            image ? (
              <ImageItem
                key={image.id}
                image={image}
                handleImageClick={handleImageClick}
                isChecked={selectedImages.includes(image.id)}
                setAsQueryImage={setAsQueryImage}
                score={score}
                colWidth={imageStore.colWidth}
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
