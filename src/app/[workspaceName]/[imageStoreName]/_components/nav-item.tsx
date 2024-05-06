"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type getSidebarNavItems } from "./sidebar-nav-items";

type Item = ReturnType<typeof getSidebarNavItems>[number];

export function NavItem({ item }: { item: Item }) {
  const pathname = usePathname();

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "pr-6",
        pathname === item.href
          ? "bg-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-800"
          : "hover:bg-transparent hover:underline",
      )}
    >
      <Link href={item.href}>
        {item.icon} {item.title}
      </Link>
    </Button>
  );
}
