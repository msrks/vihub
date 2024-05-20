"use client";

import { subDays } from "date-fns";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { api } from "@/trpc/react";

import type { ImageStoreType as IST } from "@/server/db/schema";
import type { DateRange } from "react-day-picker";
interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

const clip0toMax = (v: number | null, max: number) =>
  Math.min(max, Math.max(0, v ?? 0));

export function DownloadImages({ params }: Props) {
  const { data: IS } = api.imageStore.getByName.useQuery(params);
  const { mutateAsync: dlClsS } = api.image.getDatasetClsS.useMutation();
  const { mutateAsync: dlClsM } = api.image.getDatasetClsM.useMutation();
  const { mutateAsync: dlDet } = api.image.getDatasetDet.useMutation();

  const dl = (type: IST) => async (props: { from?: Date; to?: Date }) => {
    const { from, to } = props;
    toast.info("Downloading...", { duration: 100000, id: "downloading" });
    const zip = new JSZip();

    if (type === "clsS") {
      const dataset = await dlClsS({ storeId: IS!.id, from, to });
      if (!dataset.length) {
        toast.dismiss("downloading");
        toast.error("No clsS labels found");
        return;
      }
      await Promise.allSettled(
        dataset.map(async (data) => {
          const folder = zip.folder(data.key)!;
          await Promise.all(
            data.imgs.map(async (img) => {
              const res = await fetch(img.url);
              const blob = await res.blob();
              folder.file(`${img.id}.png`, blob, { base64: true });
            }),
          );
        }),
      );
    } else if (type === "clsM") {
      const { imgs, keys } = await dlClsM({ storeId: IS!.id, from, to });
      // create images folder
      const folder = zip.folder("images")!;
      await Promise.allSettled(
        imgs.map(async (img) => {
          const res = await fetch(img.url);
          const blob = await res.blob();
          folder.file(`${img.id}.png`, blob, { base64: true });
        }),
      );
      // create labels.csv
      const header = ["name", ...keys].join(",");
      const rows = imgs.map((img) =>
        [
          `${img.id}.png`,
          ...keys.map((k) => (img.labelKeys.includes(k) ? 1 : 0)),
        ].join(","),
      );
      zip.file("labels.csv", [header, ...rows].join("\n"));
    } else if (type === "det") {
      const imgs = await dlDet({ storeId: IS!.id, from, to });
      // create images folder
      const folder = zip.folder("images")!;
      await Promise.allSettled(
        imgs.map(async (img) => {
          const res = await fetch(img.url);
          const blob = await res.blob();
          folder.file(`${img.id}.png`, blob, { base64: true });
        }),
      );
      // create labels.csv
      const h = ["", "width", "height", "cls", "xmin", "ymin", "xmax", "ymax"];
      const rows = imgs.map((img) =>
        [
          `${img.id}.png`,
          img.width,
          img.height,
          img.label,
          img.label ? clip0toMax(img.xMin, img.width) : null,
          img.label ? clip0toMax(img.yMin, img.height) : null,
          img.label ? clip0toMax(img.xMax, img.width) : null,
          img.label ? clip0toMax(img.yMax, img.height) : null,
        ].join(","),
      );
      zip.file("labels.csv", [h.join(","), ...rows].join("\n"));
    } else {
      toast.dismiss("downloading");
      toast.error("Invalid type");
      return;
    }

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
        <DownloadMenu label="Single Label" download={dl("clsS")} />
        <DropdownMenuSeparator />
        {IS?.type === "clsM" && (
          <DownloadMenu label="Multi Label" download={dl("clsM")} />
        )}
        {IS?.type === "det" && (
          <DownloadMenu label="Object Detection" download={dl("det")} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DownloadMenu({
  label,
  download,
}: {
  label: string;
  download: (props: { from?: Date; to?: Date }) => Promise<void>;
}) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  return (
    <>
      <DropdownMenuLabel>{label}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => download({})}>All Time</DropdownMenuItem>
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
                onClick={() => dateRange && download(dateRange)}
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
