"use client";

import { Badge } from "@/components/ui/badge";
import { Smile } from "lucide-react";
import WorkspaceRoot from "./_components/workspace-root";
import { useSession } from "next-auth/react";

const LandingPage = () => {
  return (
    <div>
      <div className="mb-12 mt-28 flex flex-col items-center justify-center text-center sm:mt-40">
        <Badge className="mb-4 px-4 text-sm" variant="secondary">
          {/* VIHub is now alpha release! */}
          Feed high-quality data, make high-quality AI
        </Badge>
        <h1 className=" max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Generative-AI powered
          <span className="text-primary"> Visual Inspection </span>
          Toolkit
        </h1>
        <span className="mt-5 max-w-prose text-muted-foreground sm:text-lg">
          All in one platform to collect data, create dataset, train model,
          deploy to edge.
          <br />
          VIHub offers the data-centric way to develop &quot;Visual Inspection
          AI&quot;.
          <Smile className="ml-1 inline h-4 w-4" />
        </span>
      </div>
      <div className="relative isolate ">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-60 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative h-[400px] w-full rotate-[20deg] bg-gradient-to-tr from-primary to-secondary opacity-40"
          />
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const session = useSession();

  if (session.data?.user) {
    return <WorkspaceRoot />;
  } else {
    return <LandingPage />;
  }
}
