"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import { api } from "@/trpc/react";
import { usePathname, useRouter } from "next/navigation";

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  // const { data: projects } = api.project.getAll.useQuery();
  const router = useRouter();

  return (
    <div className="min-h-[48px] w-full border-b">
      <div className="flex items-center px-2 py-2">
        {/* Title */}
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "mr-auto flex items-center gap-2",
          )}
        >
          {/* <Sidebar>
            <Suspense
              fallback={<div className="flex-1 overflow-auto" />}
            ></Suspense>
          </Sidebar> */}
          <div className="text-xl font-semibold">
            <span className="text-primary">V</span>
            isual
            <span className="text-primary"> I</span>
            nspection
            <span className="text-primary"> Hub</span>
          </div>
        </Link>

        {/* {session?.user && projects?.length && projects.length > 0 && (
          <Select onValueChange={(val) => router.push(`/mshrrks.tech/${val}`)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={pathname.split("/")[2]} />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p, i) => (
                <SelectItem value={p.title} key={i}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )} */}

        {/*
        <nav className="flex items-center space-x-4 lg:space-x-6">
          <Link href="/" className="transition-colors hover:text-primary">
            Posts
          </Link>
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Users
          </Link>
        </nav> */}

        {/* User Nav */}
        <div className="ml-8 flex items-center text-muted-foreground">
          {session?.user ? (
            // <Link
            //   href="/api/auth/signout"
            //   className={cn(
            //     buttonVariants({ variant: "ghost" }),
            //     "relative h-8 w-8 rounded-full",
            //   )}
            // >
            <Button
              onClick={() => signOut()}
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt="avatar"
                />
                <AvatarFallback>
                  {session.user.name?.slice(0) ?? "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            // <Link
            //   href="/api/auth/signin"
            //   // className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            //   className={cn(buttonVariants())}
            // >
            //   Sign In
            // </Link>
            <Button onClick={() => signIn("github")} variant="secondary">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
