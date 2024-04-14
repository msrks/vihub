"use client";

import { uploadImage } from "@/app/actions/uploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { useRef } from "react";
import { toast } from "sonner";

export function ImageUploader({ imageStoreId }: { imageStoreId: number }) {
  // const uploadImageWithImageStoreId = uploadImage.bind(null, imageStoreId);

  const utils = api.useUtils();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (f) => {
        toast.info("Uploading image...");
        formRef.current!.reset();
        const res = await uploadImage(imageStoreId, f);
        toast.success(res.message);
        await utils.image.invalidate();
      }}
      className="space-y-2 p-4"
    >
      <Label htmlFor="image">Upload Image wo/ Label</Label>
      <Input type="file" id="image" name="image" required multiple />
      <Button size="sm">Upload</Button>
    </form>
  );
}
