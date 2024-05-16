"use client";

import "react-tooltip/dist/react-tooltip.css";

import { useTheme } from "next-themes";
import Link from "next/link";
import ActivityCalendar from "react-activity-calendar";
import { Tooltip } from "react-tooltip";

import type { RouterOutputs } from "@/server/api/root";
import type { Activity } from "react-activity-calendar";

type DataCount = RouterOutputs["image"]["getAllCountsByStoreId"][number];

export function ContributionsView({
  isLoading,
  dataCounts,
}: {
  isLoading?: boolean;
  dataCounts: DataCount[];
}) {
  const theme = useTheme();

  const data: Activity[] =
    [{ date: "2024-01-01", count: 0, level: 0 }, ...dataCounts]?.map((d) => ({
      ...d,
      level:
        d.count === 0
          ? 0
          : d.count <= 1
            ? 1
            : d.count <= 10
              ? 2
              : d.count <= 100
                ? 3
                : 4,
    })) ?? [];

  return (
    <>
      <div className="mb-4 mt-2 flex flex-col items-start gap-10">
        <ActivityCalendar
          loading={isLoading}
          blockSize={16}
          fontSize={14}
          colorScheme={theme.theme === "dark" ? "dark" : "light"}
          data={data}
          labels={{
            // legend: { less: "", more: "[0, 1, 5, 9, 13]" },
            // months: new Array(12).fill(0).map((_, idx) => idx + 1 + "月"),
            totalCount: "{{count}} images in {{year}}",
            // weekdays: ["日", "月", "火", "水", "木", "金", "土"],
          }}
          theme={{
            light: ["#f0f0f0", "#c4edde", "#7ac7c4", "#f73859", "#384259"],
            // dark: ["hsl(0, 0%, 22%)", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
            dark: ["#383838", "#4D455D", "#7DB9B6", "#F5E9CF", "#E96479"],
          }}
          blockMargin={2}
          showWeekdayLabels={true}
          renderBlock={(block, activity) => (
            <Link
              href={`monitoring/${activity.date}`}
              data-tooltip-id="my-tooltip"
              data-tooltip-content={
                activity.count + " @" + activity.date.slice(5).replace("-", "/")
              }
              data-tooltip-place="top"
              prefetch={false}
            >
              {block}
            </Link>
          )}
          // eventHandlers={{
          //   onClick: (e) => (activity) => router.push(`${activity.date}`),
          // }}
        />
      </div>
      <Tooltip id="my-tooltip" />
    </>
  );
}
