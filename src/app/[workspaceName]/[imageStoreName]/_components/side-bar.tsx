"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type getSidebarNavItems } from "./sidebar-nav-items";
import { Fragment } from "react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[];
}

type SidebarNavItem = ReturnType<typeof getSidebarNavItems>[number];

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex flex-col space-x-0 space-y-1", className)}
      {...props}
    >
      {["development", "operation", "genAI"].map((type) => (
        <Fragment key={type}>
          <h2 className="text-md px-1 text-sm font-semibold text-muted-foreground">
            {type === "development"
              ? "Development"
              : type === "operation"
                ? "Operation"
                : "GenAI"}
          </h2>
          {items
            .filter((item) => item.type === type)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === item.href
                    ? "bg-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-800"
                    : "hover:bg-transparent hover:underline",
                  "justify-start",
                )}
              >
                {item.icon} {item.title}
              </Link>
            ))}
        </Fragment>
      ))}
      {/* {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href
              ? "bg-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-800"
              : "hover:bg-transparent hover:underline",
            "justify-start",
          )}
        >
          {item.icon} {item.title}
        </Link>
      ))} */}
    </nav>
  );
}
