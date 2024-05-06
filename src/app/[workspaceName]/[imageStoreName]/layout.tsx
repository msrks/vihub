import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "./_components/sidebar";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full grow">
      <aside className="hidden w-fit bg-gray-100 px-2 py-2 dark:bg-gray-900 sm:block">
        <Sidebar />
      </aside>
      <ScrollArea className="h-[calc(100vh-52px)] w-full flex-1 grow px-2 py-4">
        <Suspense fallback={<Loader2 className="size-6 animate-spin" />}>
          {children}
        </Suspense>
      </ScrollArea>
    </div>
  );
}
