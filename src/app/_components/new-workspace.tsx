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
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenSquare, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2).max(50),
});

const NewWorkspace = () => {
  const utils = api.useUtils();
  const [open, setOpen] = useState(false);
  // const router = useRouter();
  const { mutateAsync: createWorkspace } = api.workspace.create.useMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name } = values;
    // const { id, ownerId } =
    const res = await createWorkspace({ name });
    if (res.error) {
      form.setError("name", {
        message: res.error,
      });
      return;
    }
    // router.push(`/${ownerId}/${id}`);
    await utils.workspace.getAll.invalidate();
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
          <DialogTitle>New Workspace</DialogTitle>
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

export default NewWorkspace;
