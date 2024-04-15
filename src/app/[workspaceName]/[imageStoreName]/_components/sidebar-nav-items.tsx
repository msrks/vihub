import { Bot, MonitorCheck, Settings, Shapes, Upload } from "lucide-react";

export const getSidebarNavItems = (wsName: string, imageStoreName: string) => [
  {
    icon: <Shapes className="mr-2 size-4" />,
    title: "Classes",
    href: `/${wsName}/${imageStoreName}/classes`,
  },
  {
    icon: <Upload className="mr-2 size-4" />,
    title: "Upload Images",
    href: `/${wsName}/${imageStoreName}/upload-images`,
  },
  {
    icon: <MonitorCheck className="mr-2 size-4" />,
    title: "Monitoring",
    href: `/${wsName}/${imageStoreName}/monitoring`,
  },
  {
    icon: <Bot className="mr-2 size-4" />,
    title: "LLM Playground",
    href: `/${wsName}/${imageStoreName}/llm-playground`,
  },
  {
    icon: <Settings className="mr-2 size-4" />,
    title: "Settings",
    href: `/${wsName}/${imageStoreName}/settings`,
  },
];
