import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";

import { HeaderNav } from "./header/header-nav";
import { Hero } from "./header/hero";
import { ThemeToggle } from "./header/theme-toggle";
import { UserMenu } from "./header/user-menu";

const Header = async () => {
  return (
    <div className="min-h-[48px] w-full border-b">
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <Hero />
            <HeaderNav />
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mx-auto" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </div>
  );
};

export default Header;
