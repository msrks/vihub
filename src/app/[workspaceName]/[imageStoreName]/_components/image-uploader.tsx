import { uploadImage } from "@/app/actions/uploadImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ImageUploader({ imageStoreId }: { imageStoreId: number }) {
  // const uploadImageWithImageStoreId = uploadImage.bind(null, imageStoreId);

  return (
    <form
      action={async (f) => {
        const res = await uploadImage(imageStoreId, f);
        toast(res.message);
      }}
      className="m-10 space-y-2 p-4"
    >
      <Label htmlFor="image">Upload Image wo/ Label</Label>
      <Input type="file" id="image" name="image" required />
      <Button size="sm">Upload</Button>
    </form>
  );
}
