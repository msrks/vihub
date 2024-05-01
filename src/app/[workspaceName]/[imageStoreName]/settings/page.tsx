"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { type ImageStore } from "../../_components/columns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function RenameField({ id, current }: { id: number; current: string }) {
  const utils = api.useUtils();
  const [name, setName] = useState(current);
  const { mutateAsync } = api.imageStore.update.useMutation();
  const router = useRouter();

  const handleClick = async () => {
    toast.info("Renaming imageStore...");
    await mutateAsync({ id, name });
    toast.success("ImageStore renamed!");
    router.push(`../${name}/settings`);
    await utils.imageStore.invalidate();
  };

  return (
    <div className="w-full space-y-1">
      <Label htmlFor="name">ImageStore name</Label>
      <div className="flex w-full items-center space-x-2">
        <Input
          id="name"
          value={name}
          className="max-w-48"
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" onClick={handleClick}>
          Rename
        </Button>
      </div>
    </div>
  );
}

function DeleteField({ id }: { id: number }) {
  const utils = api.useUtils();
  const { mutateAsync } = api.imageStore.deleteById.useMutation();
  const router = useRouter();

  const handleClick = async () => {
    toast.info("Deleting imageStore...");
    await mutateAsync({ id });
    toast.success("ImageStore deleted!");
    router.push(`../`);
    await utils.imageStore.invalidate();
  };

  return (
    <div className="flex w-full max-w-3xl items-center justify-between space-y-1">
      <div className="flex flex-col gap-1">
        <Label htmlFor="name">Delete this imageStore</Label>
        <Label className="text-muted-foreground ">
          Deleting this imageStore will delete all images associated with it.
        </Label>
      </div>
      <Button type="submit" variant="destructive" onClick={handleClick}>
        Delete
      </Button>
    </div>
  );
}

const formSchema = z.object({
  imageWidth: z.coerce.number().min(1).max(2000),
  imageHeight: z.coerce.number().min(1).max(2000),
  colWidth: z.enum(["200", "300", "400"]).transform((v) => parseInt(v, 10)),
});

function ImageListViewField({
  id,
  current,
}: {
  id: number;
  current: ImageStore;
}) {
  const utils = api.useUtils();
  const { mutateAsync } = api.imageStore.update.useMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageWidth: current.imageWidth ?? 200,
      imageHeight: current.imageHeight ?? 150,
      colWidth: current.colWidth ?? 200,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.info("Updating ImageListView Settings...");
    await mutateAsync({ id, ...values });
    toast.success("ImageListView Settings updated!");
    await utils.imageStore.invalidate();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full items-center gap-4"
      >
        <FormField
          control={form.control}
          name="imageWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>imageWidth</FormLabel>
              <FormControl>
                <Input className="max-w-48" type="number" {...field} />
              </FormControl>
              <FormDescription>to decide the aspect ratio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageHeight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>imageHeight</FormLabel>
              <FormControl>
                <Input className="max-w-48" {...field} />
              </FormControl>
              <FormDescription>to decide the aspect ratio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colWidth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>colWidth</FormLabel>
              <FormControl>
                <Input className="max-w-48" {...field} />
              </FormControl>
              <FormDescription>
                to tile images in the list view.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="secondary">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default function Page({
  params: { workspaceName, imageStoreName },
}: {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}) {
  const { data: imageStore } = api.imageStore.getByName.useQuery({
    workspaceName,
    imageStoreName,
  });

  if (!imageStore) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex flex-col gap-2">
        <h2 className="text-xl font-semibold">General</h2>
        <RenameField id={imageStore.id} current={imageStore.name} />
        <Separator />
        <h2 className="text-xl font-semibold">Image List View</h2>
        <ImageListViewField id={imageStore.id} current={imageStore} />
        <Separator />
        <h2 className="text-xl font-semibold text-destructive">Danger zone</h2>
        <DeleteField id={imageStore.id} />
      </div>
    </div>
  );
}
