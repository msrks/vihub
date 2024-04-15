import {
  Bot,
  MonitorCheck,
  Settings,
  Shapes,
  Upload,
  LineChart,
  Images,
  Brush,
} from "lucide-react";

export const getSidebarNavItems = (wsName: string, imageStoreName: string) => [
  {
    icon: <Shapes className="mr-2 size-4 text-muted-foreground" />,
    title: "Classes",
    href: `/${wsName}/${imageStoreName}/classes`,
  },
  {
    icon: <Upload className="mr-2 size-4 text-muted-foreground" />,
    title: "Upload Images",
    href: `/${wsName}/${imageStoreName}/upload-images`,
  },
  {
    icon: <Brush className="mr-2 size-4 text-muted-foreground" />,
    title: "Annotate",
    href: `/${wsName}/${imageStoreName}/annotate`,
  },
  {
    icon: <Images className="mr-2 size-4 text-muted-foreground" />,
    title: "Labled Dataset",
    href: `/${wsName}/${imageStoreName}/labeled-dataset`,
  },
  {
    icon: <MonitorCheck className="mr-2 size-4 text-muted-foreground" />,
    title: "Monitoring",
    href: `/${wsName}/${imageStoreName}/monitoring`,
  },
  {
    icon: <LineChart className="mr-2 size-4 text-muted-foreground" />,
    title: "Insights",
    href: `/${wsName}/${imageStoreName}/insights`,
  },
  {
    icon: <Bot className="mr-2 size-4 text-muted-foreground" />,
    title: "LLM Playground",
    href: `/${wsName}/${imageStoreName}/llm-playground`,
  },
  {
    icon: <Settings className="mr-2 size-4 text-muted-foreground" />,
    title: "Settings",
    href: `/${wsName}/${imageStoreName}/settings`,
  },
];
