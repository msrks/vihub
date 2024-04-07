"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { DataTable } from "../components/data-table";
// import { columns } from "./columns";
// import NewProject from "./new-project";

const ProjectRoot = () => {
  // const { data, isLoading } = api.project.getAll.useQuery();

  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="container mt-2 flex items-center justify-between">
        <h2 className="my-2 text-2xl font-semibold tracking-tight">
          All Projects
        </h2>
        <div className="ml-auto mr-4 ">{/* <NewProject /> */}</div>
      </div>
      {/* <div className="container">
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {data && <DataTable columns={columns} data={data} />}
      </div> */}
    </div>
  );
};

export default ProjectRoot;
