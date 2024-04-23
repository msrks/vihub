"use client";

import { type ImageStore } from "@/app/[workspaceName]/_components/columns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Code2 } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import type { HTMLAttributes, PropsWithoutRef } from "react";

export default function Code({
  imageStore,
  className,
  ...props
}: PropsWithoutRef<HTMLAttributes<HTMLButtonElement>> & {
  imageStore: ImageStore;
}) {
  const { data: ws } = api.workspace.getById.useQuery({
    id: imageStore.workspaceId,
  });

  const code = `
import requests

with open(FILE_PATH, "rb") as f:
    res = requests.post(
        "https://vihub.msrks.dev/api/upload/v1?storeId=${imageStore.id}",
        headers={"apiKey": "${ws?.apiKey}"},
        files={"file": (FILE_PATH, f)},
        data={"aiLabelKey": LABEL_KEY, "aiLabelConfidence": CONFIDENCE},
    )
`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className={className} {...props}>
          Upload by API
          <Code2 className="ml-2 size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <Highlight theme={themes.vsDark} code={code} language="py">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style} className={cn(className, "mx-auto w-fit pr-6")}>
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
      </DialogContent>
    </Dialog>
  );
}
