"use server";

import { api } from "@/trpc/server";
import { InfiniteImages } from "../../../../../components/infinite-images";

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
