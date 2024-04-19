"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenSquare, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(1).max(50),
  labelClassId: z.string().min(1).max(50),
});

const NewExperiment = ({ imageStoreId }: { imageStoreId: number }) => {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  const { mutateAsync: createExperiment } =
    api.promptingExperiment.create.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", labelClassId: "" },
  });

  const { data: labelClasses } = api.labelClass.getAll.useQuery({
    imageStoreId: imageStoreId,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { title, labelClassId } = values;
    const res = await createExperiment({
      title,
      imageStoreId,
      labelClassId: parseInt(labelClassId),
    });
    // TODO: handle error
    if (res.error) {
      form.setError("title", {
        message: res.error,
      });
      return;
    }
    await utils.promptingExperiment.invalidate();
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
          <DialogTitle>Create New Experiment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labelClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="select target labelClass" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {labelClasses?.map((lc) => (
                        <SelectItem key={lc.id} value={lc.id.toString()}>
                          {lc.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                Save <PenSquare className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewExperiment;
