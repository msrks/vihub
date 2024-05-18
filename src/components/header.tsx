import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { getServerAuthSession } from "@/server/auth";

import { HeaderNav } from "./header/header-nav";
import { Hero } from "./header/hero";
import { ThemeToggle } from "./header/theme-toggle";
import { UserMenu } from "./header/user-menu";

const Header = async () => {
  const session = await getServerAuthSession();
  return (
    <div className="min-h-[48px] w-full border-b">
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            <Hero />
            {session && <HeaderNav />}
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
