"use client";

import { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadIcon } from "lucide-react";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { upload } from "@vercel/blob/client";

export default function ImageUploadClientSide({
  imageStoreId,
}: {
  imageStoreId: number;
}) {
  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId,
  });
  const utils = api.useUtils();

  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((files: File[]) => {
    setSelectedFiles(files);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        toast.info("Uploading images...", {
          duration: 100000,
          id: "uploading",
        });
        setUploading(true);
        const filepath = `${process.env.NEXT_PUBLIC_BLOB_NAME_SPACE!}/${imageStoreId}/images/`;
        await Promise.all(
          selectedFiles.map(async (file) => {
            return await upload(filepath + file.name, file, {
              access: "public",
              handleUploadUrl: "/api/image/upload",
              clientPayload: JSON.stringify({
                imageStoreId,
                humanLabelId: parseInt(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  e.currentTarget.humanLabelId.value as string,
                ),
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
      className="w-full space-y-4 px-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Upload</h3>

        <Button disabled={uploading} size="sm">
          {uploading ? "Uploading..." : "Submit"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Label>LabelClass</Label>
        <Select name="humanLabelId" required>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder=" -- select -- " />
          </SelectTrigger>
          <SelectContent>
            {labelClasses?.map((lc) => (
              <SelectItem key={lc.id} value={lc.id.toString()}>
                {lc.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className="flex w-full items-center justify-center"
      >
        <label
          htmlFor="images"
          className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-20"
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
