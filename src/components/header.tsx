import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb";
import { ThemeToggle } from "./header/theme-toggle";
import { Hero } from "./header/hero";
import { UserMenu } from "./header/user-menu";
import { HeaderNav } from "./header/header-nav";

const Header = () => {
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
