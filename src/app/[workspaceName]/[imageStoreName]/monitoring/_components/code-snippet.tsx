import "server-only";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/server";
import { Code2 } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";

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
        <Tabs defaultValue="singleLabelClassification">
          <TabsList>
            <TabsTrigger value="singleLabelClassification">
              Classification(Single Label)
            </TabsTrigger>
            <TabsTrigger value="multiLabelClassification">
              Classification(Multi Label)
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Suspense>
          <TabsContents params={params} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}

async function TabsContents({
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
  } as const;

  return (
    <>
      {Object.keys(codes).map((key) => (
        <TabsContent key={key} value={key}>
          <Highlight
            theme={themes.vsDark}
            code={codes[key as keyof typeof codes]}
            language="py"
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                style={style}
                className={cn(className, "mx-auto w-fit pr-6")}
              >
                {tokens.map((line, i) => {
                  const { key, ...rest } = getLineProps({ line, key: i });
                  return (
                    <div key={i} style={{ position: "relative" }} {...rest}>
                      <span className="select-none pr-8 text-zinc-500 ">
                        {i + 1 < 10 ? ` ${i + 1}` : i + 1}
                      </span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </div>
                  );
                })}
              </pre>
            )}
          </Highlight>
        </TabsContent>
      ))}
    </>
  );
}
