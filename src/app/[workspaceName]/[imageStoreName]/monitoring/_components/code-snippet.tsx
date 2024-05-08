import "server-only";

import { Code2 } from "lucide-react";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
          <Contents params={params} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

async function Contents({ params }: Props) {
  const { apiKey } = await api.workspace.getByName({
    name: params.workspaceName,
  });
  const { id } = await api.imageStore.getByName(params);

  const codes = {
    singleLabelClassification: `
import requests

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${id}",
        headers={"apiKey": "${apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={"aiLabelKey": LABEL_KEY, "aiLabelConfidence": CONFIDENCE},
    )
    `,
    multiLabelClassification: `
import requests
import json

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${id}",
        headers={"apiKey": "${apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={
            "aiLabelKey": LABEL_KEY,
            "aiLabelConfidence": CONFIDENCE,
            "aiMultiClassLabels": json.dumps(
                [
                    {
                        "labelKey": L_KEY_1,
                        "confidence": C_1,
                        "aiModelKey": M_KEY_1,
                        "isPositive": True,
                    },
                    {
                        "labelKey": L_KEY_2,
                        "confidence": C_2,
                        "aiModelKey": M_KEY_2,
                        "isPositive": False,
                    },
                ]
            ),
        },
    )    
    `,
  };

  return <CodeTabs codes={codes} />;
}
