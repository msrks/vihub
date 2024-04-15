"use client";

import { api } from "@/trpc/react";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ActivityCalendar from "react-activity-calendar";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import { useTheme } from "next-themes";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { searchImages } from "@/app/actions/searchImages";
import Image from "next/image";
import { ImageViewerComponent } from "../../../../components/imageViewerComponent";

type SearchResults = Awaited<ReturnType<typeof searchImages>>;

interface Props {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}

export default function Page({ params }: Props) {
  const theme = useTheme();

  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName: params.workspaceName,
    imageStoreName: params.imageStoreName,
  });
  const { data: dataCounts, isLoading } =
    api.image.getAllCountsByStoreId.useQuery(
      { imageStoreId: imageStore?.id ?? 0 },
      { enabled: !!imageStore },
    );

  const [text, setText] = useState("");
  const [queryText] = useDebounce(text, 1000);
  const [searchResults, setSearchResults] = useState<SearchResults>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { mutateAsync } = api.ai.searchImages.useMutation();

  const setAsQueryImage = async (url: string) => {
    if (imageStore === undefined) return;

    setText("");
    setSelectedImage(url);
    setLoading(true);
    // const results = await searchImages(url, id);
    const results = await mutateAsync({
      queryText: url,
      namespace: imageStore.id.toString(),
    });
    setLoading(false);
    setSearchResults(results);
  };

  useEffect(() => {
    if (imageStore === undefined) return;

    const searchByText = async () => {
      setSelectedImage(null);
      setLoading(true);
      // const results = await searchImages(queryText, id);
      const results = await mutateAsync({
        queryText,
        namespace: imageStore?.id.toString(),
      });
      setLoading(false);
      setSearchResults(results);
    };

    queryText && void searchByText();
  }, [imageStore, queryText]);

  if (!imageStore) return null;

  return (
    <div className="relative flex w-full grow flex-col items-center">
      <Button asChild size="sm" className="absolute right-0 top-0">
        <Link
          href="https://pypi.org/project/vihub/"
          className="flex items-center"
        >
          <span> Python SDK </span>
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      {/* {process.env.NODE_ENV === "development" && (
        <ImageUploader imageStoreId={imageStore.id} />
      )} */}

      {dataCounts && dataCounts?.length !== 0 ? (
        <>
          <div className="mb-4 mt-2 flex flex-col items-start gap-10">
            <ActivityCalendar
              loading={isLoading}
              blockSize={16}
              fontSize={14}
              colorScheme={theme.theme as "dark"}
              data={
                [
                  { date: "2024-01-01", count: 0, level: 0 },
                  ...dataCounts,
                ]?.map((d) => ({
                  ...d,
                  level:
                    d.count === 0
                      ? 0
                      : d.count <= 1
                        ? 1
                        : d.count <= 10
                          ? 2
                          : d.count <= 100
                            ? 3
                            : 4,
                })) ?? []
              }
              labels={{
                // legend: { less: "", more: "[0, 1, 5, 9, 13]" },
                // months: new Array(12).fill(0).map((_, idx) => idx + 1 + "月"),
                totalCount: "{{count}} images in {{year}}",
                // weekdays: ["日", "月", "火", "水", "木", "金", "土"],
              }}
              theme={{
                light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#f73859", "#384259"],
                // dark: ["hsl(0, 0%, 22%)", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
                dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
              }}
              blockMargin={2}
              showWeekdayLabels={true}
              renderBlock={(block, activity) => (
                <Link
                  href={`monitoring/${activity.date}`}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content={
                    activity.count +
                    " @" +
                    activity.date.slice(5).replace("-", "/")
                  }
                  data-tooltip-place="top"
                >
                  {block}
                </Link>
              )}
              // eventHandlers={{
              //   onClick: (e) => (activity) => router.push(`${activity.date}`),
              // }}
            />
          </div>
          <Tooltip id="my-tooltip" />
          <div className="m-2 flex items-center gap-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row ">
              <Label htmlFor="queryText" className="text-nowrap">
                queryText
              </Label>
              <Input
                type="text"
                id="queryText"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row ">
              <Label htmlFor="queryText" className="text-nowrap">
                queryImage
              </Label>
              {selectedImage ? (
                <div className="relative h-[90px] w-[120px] overflow-hidden">
                  <Image
                    src={selectedImage}
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
                  <p>try to click image</p>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <Loader2 className="mx-auto size-8 animate-spin" />
          ) : searchResults.length === 0 ? (
            <ImageViewerComponent
              imageStoreId={imageStore.id}
              setAsQueryImage={setAsQueryImage}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {searchResults.map((result, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    key={i}
                    className="relative h-[150px] w-[200px] overflow-hidden"
                    onClick={() => setAsQueryImage?.(result.src)}
                  >
                    <Image
                      src={result.src}
                      alt=""
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      sizes="200px"
                    />
                  </div>
                  <p className="bg-primar w-full text-center">
                    Score: {result.score?.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-[200px]">
          <p>There is no data yet.</p>
        </div>
      )}
    </div>
  );
}
