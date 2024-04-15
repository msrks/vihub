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
import { uploadImage } from "@/app/actions/uploadImage";

export default function ImageUpload({
  imageStoreId,
}: {
  imageStoreId: number;
}) {
  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId,
  });
  const utils = api.useUtils();

  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<Blob[]>([]);

  const onDrop = useCallback((files: Blob[]) => {
    setSelectedFiles(files);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <form
      action={async (f) => {
        toast.info("Uploading image...");
        setUploading(true);
        selectedFiles.forEach((file) => f.append("images", file));
        setSelectedFiles([]);
        const res = await uploadImage(imageStoreId, f);
        toast.success(res.message);
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
        <Select required name="humanLabelId">
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
        className=" flex w-full items-center justify-center"
      >
        <label
          htmlFor="images"
          className="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-[1px] border-dashed py-6"
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
