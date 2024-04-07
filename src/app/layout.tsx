import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NextAuthProvider from "@/context/NextAuthProvider";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "VIHub",
  description: "by @msrks",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-screen flex-col items-center bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        {/* <SessionProvider session={session}> */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <NextAuthProvider>
              <Header session={session} />
              {children}
              <Toaster />
              {/* <Footer /> */}
              <ThemeToggle className="absolute bottom-2 left-2" />
            </NextAuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
