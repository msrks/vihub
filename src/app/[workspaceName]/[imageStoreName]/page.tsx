import { redirect } from "next/navigation";

interface Props {
  params: {
    workspaceName: string;
    imageStoreName: string;
  };
}

export default function Page({ params }: Props) {
  return redirect(
    `/${params.workspaceName}/${params.imageStoreName}/monitoring`,
  );
}
