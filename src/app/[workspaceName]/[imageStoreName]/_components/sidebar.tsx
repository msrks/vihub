"use client";

import { cn } from "@/lib/utils";
import { Fragment } from "react";
import { NavItem } from "./nav-item";
import { useParams } from "next/navigation";
import { getSidebarNavItems } from "./sidebar-nav-items";

export function Sidebar() {
  const params = useParams();
  const items = getSidebarNavItems(
    params.workspaceName as string,
    params.imageStoreName as string,
  );

  return (
    <nav className={cn("flex flex-col items-start space-x-0 space-y-1")}>
      {["development", "operation", "generative AI"].map((type) => (
        <Fragment key={type}>
          <h2 className="text-md px-1 text-sm font-semibold capitalize text-muted-foreground">
            {type}
          </h2>
          {items
            .filter((item) => item.type === type)
            .map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
        </Fragment>
      ))}
    </nav>
  );
}
