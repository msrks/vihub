import "server-only";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Code2 } from "lucide-react";
import { Suspense } from "react";
import { api } from "@/trpc/server";
import { CodeTabs } from "./code-tabs";

interface Props {
  params: { workspaceName: string; imageStoreName: string };
}

export async function Code({ params }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          Upload by API
          <Code2 className="ml-2 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="h-5/6 w-fit sm:max-w-5xl">
        <Suspense>
          <CodeContents params={params} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

async function CodeContents({
  params: { workspaceName, imageStoreName },
}: Props) {
  const ws = await api.workspace.getByName({
    name: workspaceName,
  });

  const imageStore = await api.imageStore.getByName({
    workspaceName,
    imageStoreName,
  });

  const codes = {
    singleLabelClassification: `
  import requests
  
  with open(FILE_PATH, "rb") as f:
      res = requests.post(
          "https://vihub.msrks.dev/api/upload/v1?storeId=${imageStore.id}",
          headers={"apiKey": "${ws?.apiKey}"},
          files={"file": (FILE_PATH, f)},
          data={"aiLabelKey": LABEL_KEY, "aiLabelConfidence": CONFIDENCE},
      )
    `,
    multiLabelClassification: `
  import requests
  import json
  
  with open(FILE_PATH, "rb") as f:
      res = requests.post(
          "https://vihub.msrks.dev/api/upload/v1?storeId=${imageStore.id}",
          headers={"apiKey": "${ws?.apiKey}"},
          files={"file": (FILE_PATH, f)},
          data={
              "aiLabelKey": LABEL_KEY,
              "aiLabelConfidence": CONFIDENCE,
              "aiMultiClassLabels": json.dumps(
          [
              {"labelKey": L_KEY_1, "confidence": C_1, "aiModelKey": M_KEY_1, "isPositive": True},
              {"labelKey": L_KEY_2, "confidence": C_2, "aiModelKey": M_KEY_2, "isPositive": False},
          ]
              ),
          },
      )   
    `,
  };

  return <CodeTabs codes={codes} />;
}
