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
    type: "development",
  },
  {
    icon: <Upload className="mr-2 size-4 text-muted-foreground" />,
    title: "Upload Images",
    href: `/${wsName}/${imageStoreName}/upload-images`,
    type: "development",
  },
  {
    icon: <Brush className="mr-2 size-4 text-muted-foreground" />,
    title: "Annotate",
    href: `/${wsName}/${imageStoreName}/annotate`,
    type: "development",
  },
  {
    icon: <Images className="mr-2 size-4 text-muted-foreground" />,
    title: "Dataset",
    href: `/${wsName}/${imageStoreName}/dataset`,
    type: "development",
  },
  {
    icon: <MonitorCheck className="mr-2 size-4 text-muted-foreground" />,
    title: "Monitoring",
    href: `/${wsName}/${imageStoreName}/monitoring`,
    type: "operation",
  },
  {
    icon: <LineChart className="mr-2 size-4 text-muted-foreground" />,
    title: "Insights",
    href: `/${wsName}/${imageStoreName}/insights`,
    type: "operation",
  },
  {
    icon: <Bot className="mr-2 size-4 text-muted-foreground" />,
    title: "LLM Playground",
    href: `/${wsName}/${imageStoreName}/llm-playground`,
    type: "genAI",
  },
  {
    icon: <Settings className="mr-2 size-4 text-muted-foreground" />,
    title: "Settings",
    href: `/${wsName}/${imageStoreName}/settings`,
    type: "genAI",
  },
];
