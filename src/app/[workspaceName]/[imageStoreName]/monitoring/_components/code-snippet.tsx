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
  const { id, type } = await api.imageStore.getByName(params);

  const codes = {
    clsS: `import requests

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${id}",
        headers={"apiKey": "${apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={
            "aiLabelKey": LABEL_KEY,
            "aiLabelConfidence": CONFIDENCE
            # "skipAnnotation": True, # or False
        },
    )
    `,
    clsM: `import requests
import json

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${id}",
        headers={"apiKey": "${apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={
            # "skipAnnotation": True, # or False
            "aiLabelKey": LABEL_KEY, # if you want to add single label
            "aiLabelConfidence": CONFIDENCE, # if you want to add single label
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
    // TODO: Add code for object detection
    det: `import requests
import json

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${id}",
        headers={"apiKey": "${apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={
            "skipAnnotation": True, # or False
            "detLabelString": json.dumps(
                [
                    {
                        "type": "ai", # or "human"
                        "labelKey": "L_KEY_1",
                        "confidence": 0.99,
                        "aiModelKey": "M_KEY_1",
                        "xMin": XMIN_1, # integer (pixel) left
                        "xMax": XMAX_1, # integer (pixel) right
                        "yMin": YMIN_1, # integer (pixel) top
                        "yMax": YMAX_1, # integer (pixel) bottom
                    }, 
                    {
                        "type": "ai",
                        "labelKey": "L_KEY_2",
                        "confidence": 0.55,
                        "aiModelKey": "M_KEY_2",
                        "xMin": XMIN_2,
                        "xMax": XMAX_2,
                        "yMin": YMIN_2,
                        "yMax": YMAX_2,
                    },
                ]
            ),
        },
    )  
`,
  };

  return <CodeTabs codes={codes} type={type} />;
}
