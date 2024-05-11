"use client";

import { PenSquare, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { imageStoreTypeList, insertImageStoreSchema } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";

import type { WSProps } from "../page";
// const formSchema = z.object({
//   name: z.string().min(2).max(50),
//   type: z.enum(["img", "s3"]),
// });
const formSchema = insertImageStoreSchema.pick({ name: true, type: true });

const NewImageStore = ({ params }: WSProps) => {
  const { data: ws } = api.workspace.getByName.useQuery({
    name: params.workspaceName,
  });

  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync: createImageStore } = api.imageStore.create.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", type: "clsS" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, type } = values;
    toast.info("Creating ImageStore");
    await createImageStore({
      name,
      type: type ?? "clsS",
      workspaceId: ws!.id,
    });
    // if (res.error) {
    //   form.setError("name", {
    //     message: res.error,
    //   });
    //   return;
    // }
    toast.success("ImageStore created successfully");
    router.refresh();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={buttonVariants({
          variant: "secondary",
          size: "sm",
        })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        New
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New ImageStore</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="type here .." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent ref={field.ref}>
                      {imageStoreTypeList.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                New <PenSquare className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewImageStore;
