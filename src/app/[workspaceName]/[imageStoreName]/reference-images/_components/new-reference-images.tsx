"use client";

import { uploadRefImage } from "@/app/actions/uploadRefImage";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Loader2, PlusCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const NewReferenceImages = ({ imageStoreId }: { imageStoreId: number }) => {
  const ref = useRef<HTMLInputElement>(null);
  const utils = api.useUtils();
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const form = new FormData();
      const files = Array.from(e.target.files);
      files.forEach((file) => form.append("images", file));
      toast.info("Uploading Reference Images...");
      await uploadRefImage(imageStoreId, form);
      toast.success("Reference Images uploaded successfully!");
      e.target.files = null;
      if (ref.current) ref.current.value = "";
      setUploading(false);
      await utils.referenceImage.invalidate();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={ref}
        onChange={handleChange}
        multiple
        className="hidden"
      />
      <Button
        size="sm"
        onClick={(): void => ref.current?.click()}
        variant="secondary"
      >
        {!uploading && (
          <>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </>
        )}
        {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
      </Button>
    </>
  );
};

export default NewReferenceImages;
