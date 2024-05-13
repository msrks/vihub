"use client";

import { Loader2, UploadIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { upload } from "@vercel/blob/client";

import type { ImageStoreType } from "@/server/db/schema";
import type { FormEvent } from "react";

export default function ImageUploadClientSide({
  imageStoreId,
  type,
}: {
  imageStoreId: number;
  type: ImageStoreType;
}) {
  const { data: classes } = api.labelClass.getAll.useQuery({ imageStoreId });
  const utils = api.useUtils();
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const onDrop = useCallback((files: File[]) => setSelectedFiles(files), []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <form
      onSubmit={async (
        e: FormEvent<HTMLFormElement & { humanLabelId?: HTMLInputElement }>,
      ) => {
        e.preventDefault();
        toast.info("Uploading...", { duration: 100000, id: "uploading" });
        setUploading(true);
        const filepath = `${process.env.NEXT_PUBLIC_BLOB_NAME_SPACE!}/${imageStoreId}/images/`;
        await Promise.all(
          selectedFiles.map(async (file) => {
            return await upload(filepath + file.name, file, {
              access: "public",
              handleUploadUrl: "/api/image/upload",
              clientPayload: JSON.stringify({
                imageStoreId,
                ...(e.currentTarget.humanLabelId
                  ? {
                      humanLabelId: parseInt(
                        e.currentTarget.humanLabelId.value,
                      ),
                    }
                  : {}),
              }),
            });
          }),
        );
        toast.dismiss("uploading");
        toast.success("Images uploaded successfully");
        setSelectedFiles([]);
        setUploading(false);
        await utils.image.invalidate();
      }}
      className=" flex h-[calc(100vh-84px)] w-full flex-col space-y-4 px-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Upload</h3>

        <Button disabled={uploading} size="sm">
          {uploading ? "Uploading..." : "Submit"}
        </Button>
      </div>

      {type === "clsS" && (
        <div className="flex items-center gap-2">
          <Label>LabelClass</Label>
          <Select name="humanLabelId">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder=" -- select -- " />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((lc) => (
                <SelectItem key={lc.id} value={lc.id.toString()}>
                  {lc.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div
        {...getRootProps()}
        className="flex w-full grow items-center justify-center border border-dashed"
      >
        <label
          htmlFor="images"
          className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg py-20"
        >
          <div className="max-w-md text-center">
            {uploading ? (
              <>
                <p className="font-semibold">Uploading Picture</p>
                <Loader2 className="size-6 animate-spin" />
                <p className="text-xs text-muted-foreground">
                  Do not refresh or perform any other action while the picture
                  is being upload
                </p>
              </>
            ) : selectedFiles.length !== 0 ? (
              <p className="mt-2 text-sm font-semibold">
                {selectedFiles.length} Files are selected
              </p>
            ) : (
              <>
                <div className=" mx-auto max-w-min rounded-md border p-2">
                  <UploadIcon className=" mx-auto size-10" />
                </div>
                <p className="mt-2 text-sm font-semibold">Drag an image</p>
                <p className="text-xs text-muted-foreground">
                  Click to upload (image should be under XX MB)
                </p>
              </>
            )}
          </div>
        </label>

        <Input
          {...getInputProps()}
          id="images"
          accept="image/png, image/jpeg"
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
        />
      </div>
    </form>
  );
}
