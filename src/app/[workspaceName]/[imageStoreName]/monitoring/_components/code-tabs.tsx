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
      {Object.keys(codes).map((key) => (
        <TabsContent key={key} value={key}>
          <Highlight
            theme={themes.vsDark}
            code={codes[key] ?? ""}
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
    </Tabs>
  );
}
