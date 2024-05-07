import { Loader } from "@/components/ui/loader";
import { api } from "@/trpc/server";
import { Suspense } from "react";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Training</h2>
      </div>
      <Suspense fallback={<Loader />}>
        <Training params={params} />
      </Suspense>
    </div>
  );
}

async function Training({ params }: Props) {
  const imageStore = await api.imageStore.getByName(params);

  return <div>now unavailable</div>;
}
