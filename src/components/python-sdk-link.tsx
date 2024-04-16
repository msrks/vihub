import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "react-tooltip/dist/react-tooltip.css";
import type { HTMLAttributes, PropsWithoutRef } from "react";

export function PythonSdkLink({
  className,
  ...props
}: PropsWithoutRef<HTMLAttributes<HTMLButtonElement>>) {
  return (
    <Button asChild size="sm" className={className} {...props}>
      <Link
        href="https://pypi.org/project/vihub/"
        className="flex items-center"
      >
        <span> Python SDK </span>
        <ExternalLink className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
