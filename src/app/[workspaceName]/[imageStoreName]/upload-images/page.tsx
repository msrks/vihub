import { api } from "@/trpc/server";

import ImageUploadClientSide from "./_components/image-upload-client-side";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export default async function Page({ params }: Props) {
  const imageStore = await api.imageStore.getByName(params);

  return (
    <div className="flex w-full grow flex-col items-center">
      <ImageUploadClientSide imageStoreId={imageStore.id} />
    </div>
  );
}
