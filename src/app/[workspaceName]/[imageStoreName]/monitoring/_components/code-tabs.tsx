"use client";

import { cn } from "@/lib/utils";
import { Highlight, themes } from "prism-react-renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CodeTabs({ codes }: { codes: Record<string, string> }) {
  return (
    <Tabs defaultValue="singleLabelClassification">
      <TabsList>
        <TabsTrigger value="singleLabelClassification">
          Classification(Single Label)
        </TabsTrigger>
        <TabsTrigger value="multiLabelClassification">
          Classification(Multi Label)
        </TabsTrigger>
      </TabsList>
      {Object.entries(codes).map(([_key, value]) => (
        <TabsContent key={_key} value={_key}>
          <Highlight theme={themes.vsDark} code={value} language="py">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                style={style}
                className={cn(className, "mx-auto w-fit pr-6")}
              >
                {tokens.map((line, i) => {
                  const props = getLineProps({ line, key: i });
                  return (
                    <div key={i} style={{ position: "relative" }} {...props}>
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
    </Tabs>
  );
}
