"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function UserMenu() {
  const { data } = useSession();

  return (
    <div className="flex items-center text-muted-foreground">
      {data?.user ? (
        <Button
          onClick={() => signOut()}
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={data.user.image ?? undefined} alt="avatar" />
            <AvatarFallback>{data.user.name?.slice(0) ?? "A"}</AvatarFallback>
          </Avatar>
        </Button>
      ) : (
        <Button onClick={() => signIn("github")} variant="secondary">
          Sign In
        </Button>
      )}
    </div>
  );
}
