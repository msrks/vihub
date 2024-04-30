"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CustomLineChart({
  data,
  valueKey,
}: {
  valueKey: string;
  data: {
    date: string;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="hsl(var(--muted))" />
        <XAxis
          fontSize={13}
          dataKey="date"
          tickFormatter={(tick: string) => tick.split("-")[2] ?? ""}
          // stroke="hsl(var(--primary))"
        />
        <YAxis
          fontSize={13}
          // tickFormatter={(tick) => tick}
          // stroke="hsl(var(--primary))"
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload?.length) {
              return (
                <div className="rounded-lg border bg-background/80 p-2 shadow-sm">
                  <span className="font-bold text-muted-foreground">
                    {/* {label} :{" "} */}
                    {typeof payload[0]?.value === "number"
                      ? payload[0]?.value.toFixed(2)
                      : payload[0]?.value}
                  </span>
                </div>
              );
            }

            return null;
          }}
        />
        <Line
          type="monotone"
          strokeWidth={2}
          dataKey={valueKey}
          activeDot={{
            r: 6,
            style: { fill: "hsl(var(--primary))", opacity: 0.25 },
          }}
          stroke="hsl(var(--primary))"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
