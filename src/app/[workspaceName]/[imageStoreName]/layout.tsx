import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarNav } from "./_components/side-bar";
import { getSidebarNavItems } from "./_components/sidebar-nav-items";

interface LayoutProps {
  children: React.ReactNode;
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}

export default async function Layout({ children, params }: LayoutProps) {
  return (
    <div className="flex w-full grow">
      <aside className="hidden w-fit bg-gray-100 px-2 py-2 dark:bg-gray-900 sm:block">
        <SidebarNav
          items={getSidebarNavItems(
            params.workspaceName,
            params.imageStoreName,
          )}
        />
      </aside>
      <ScrollArea className="h-[calc(100vh-52px)] w-full flex-1 grow px-2 py-4">
        {children}
      </ScrollArea>
    </div>
  );
}
