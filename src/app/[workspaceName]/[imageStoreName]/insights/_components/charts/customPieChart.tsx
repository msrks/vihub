/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-sm"
    >
      {name} {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CustomPieChart({
  data,
  valueKey,
}: {
  valueKey: string;
  data: {
    name: string;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={({ active, payload }) => {
            if (active && payload?.length) {
              return (
                <div className="rounded-lg border bg-background/80 p-2 shadow-sm">
                  <span className="font-bold text-muted-foreground">
                    {payload[0]?.payload.name} : {payload[0]?.value}
                  </span>
                </div>
              );
            }

            return null;
          }}
        />
        <Pie
          data={data}
          nameKey="name"
          dataKey={valueKey}
          fill="hsl(var(--primary))"
          // opacity={0.5}
          label={renderCustomizedLabel}
          labelLine={false}
          cx="50%"
          cy="50%"
          outerRadius="100%"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
