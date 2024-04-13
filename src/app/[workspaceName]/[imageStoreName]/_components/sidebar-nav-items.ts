export const getSidebarNavItems = (wsName: string, imageStoreName: string) => [
  {
    title: "Classes",
    href: `/${wsName}/${imageStoreName}/classes`,
  },
  {
    title: "Monitoring",
    href: `/${wsName}/${imageStoreName}/monitoring`,
  },
  {
    title: "LLM Playground",
    href: `/${wsName}/${imageStoreName}/llm-playground`,
  },
];
