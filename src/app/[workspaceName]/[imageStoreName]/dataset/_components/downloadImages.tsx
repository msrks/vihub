"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { type DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { api } from "@/trpc/react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "sonner";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export function DownloadImages({
  params: { imageStoreName, workspaceName },
}: Props) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    imageStoreName,
    workspaceName,
  });
  const { mutateAsync: download } = api.image.getDataset.useMutation();
  const { mutateAsync: downloadMultiLabel } =
    api.image.getDatasetMultiLabel.useMutation();

  const downloadDataset = async (dateRange?: DateRange) => {
    toast.info("Downloading...", {
      duration: 100000,
      id: "downloading",
    });
    const dataset = await download({
      imageStoreId: imageStore!.id,
      from: dateRange?.from,
      to: dateRange?.to,
    });
    const zip = new JSZip();
    await Promise.all(
      dataset.map(async (data) => {
        const folder = zip.folder(data.key);
        if (!folder) return;
        await Promise.all(
          data.imgs.map(async (img) => {
            const res = await fetch(img.url);
            const blob = await res.blob();
            folder.file(`${img.id}.png`, blob, { base64: true });
          }),
        );
      }),
    );
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "dataset.zip");

    toast.dismiss("downloading");
    toast.success("Images downloaded successfully");
  };

  const downloadMultiLabelDataset = async (dateRange?: DateRange) => {
    toast.info("Downloading...", {
      duration: 100000,
      id: "downloading",
    });

    const { imgs, keys } = await downloadMultiLabel({
      imageStoreId: imageStore!.id,
      from: dateRange?.from,
      to: dateRange?.to,
    });
    const zip = new JSZip();
    const folder = zip.folder("images");
    if (!folder) return;

    await Promise.all(
      imgs.map(async (img) => {
        const res = await fetch(img.url);
        const blob = await res.blob();
        folder.file(`${img.id}.png`, blob, { base64: true });
      }),
    );

    const header = ["name", ...keys].join(",");
    const rows = imgs.map((img) =>
      [
        `${img.id}.png`,
        ...keys.map((k) => (img.labelKeys.includes(k) ? 1 : 0)),
      ].join(","),
    );

    zip.file("labels.csv", [header, ...rows].join("\n"));

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "dataset.zip");

    toast.dismiss("downloading");
    toast.success("Images downloaded successfully");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          Download
          <Download className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DownloadMenu label="Single Label" handler={downloadDataset} />
        <DropdownMenuSeparator />
        <DownloadMenu label="Multi Label" handler={downloadMultiLabelDataset} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DownloadMenu({
  label,
  handler,
}: {
  label: string;
  handler: (dateRange?: DateRange) => void;
}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  return (
    <>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handler()}>All Time</DropdownMenuItem>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <div>
            <Calendar
              mode="range"
              disabled={{ after: new Date() }}
              selected={dateRange}
              defaultMonth={dateRange?.from}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
            <DropdownMenuItem>
              <Button
                onClick={() => dateRange && handler(dateRange)}
                disabled={dateRange == null}
                className="w-full"
              >
                Download
              </Button>
            </DropdownMenuItem>
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </>
  );
}
