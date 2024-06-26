import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { Suspense } from "react";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import NextAuthProvider from "@/context/NextAuthProvider";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";
import { Analytics } from "@vercel/analytics/react";

import { baseUrl, description, title } from "./sitemap";

import type { Metadata } from "next";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description: description,
  openGraph: {
    title: title,
    description: description,
    url: baseUrl,
    siteName: title,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerAuthSession();

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
              <Suspense>
                <Header />
              </Suspense>
              {children}
              <Toaster richColors />
              {/* <Footer /> */}
              <Analytics />
            </NextAuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
