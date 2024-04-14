"use server";

import { api } from "@/trpc/server";
import { ImageViewerComponent } from "../../../../../components/imageViewerComponent";

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
  return <ImageViewerComponent imageStoreId={imageStore.id} date={date} />;
}
