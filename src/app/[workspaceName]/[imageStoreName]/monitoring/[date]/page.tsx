"use server";

import { InfiniteImages } from "@/components/infinite-images";
import { api } from "@/trpc/server";

export default async function Page({
  params: { workspaceName, imageStoreName, date },
}: {
  params: {
    workspaceName: string;
    imageStoreName: string;
    date: string;
  };
}) {
  const imageStore = await api.imageStore.getByName({
    workspaceName,
    imageStoreName,
  });
  return <InfiniteImages imageStoreId={imageStore.id} date={date} />;
}
