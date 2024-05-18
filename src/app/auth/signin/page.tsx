"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function Page({
  searchParams,
}: {
  searchParams: {
    callbackUrl?: string;
  };
}) {
  return (
    <div className="mx-auto my-2 flex max-w-sm grow flex-col items-center justify-center gap-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          signIn("github", {
            callbackUrl: searchParams?.callbackUrl,
          })
        }
      >
        <Github className="mr-2 size-5" />
        Continue with GitHub
      </Button>
    </div>
  );
}
