import Link from "next/link";
import { BreadcrumbItem } from "../ui/breadcrumb";

export function Hero() {
  return (
    <BreadcrumbItem>
      <Link href="/" className="text-xl font-semibold text-foreground">
        <span className="text-primary">V</span>
        <span className="hidden  md:inline">isual </span>
        <span className="text-primary">I</span>
        <span className="hidden  md:inline">nspection </span>
        <span className="text-primary"> Hub</span>
      </Link>
    </BreadcrumbItem>
  );
}
