"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CustomBarChart({
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
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--muted))" />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))" }}
          content={({ active, payload, label }) => {
            if (active && payload?.length) {
              return (
                <div className="flex flex-col rounded-lg border bg-background/80 p-2 shadow-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold text-muted-foreground">
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
        <YAxis domain={[0, "auto"]} fontSize={13} />
        <XAxis
          fontSize={13}
          dataKey="date"
          // tickFormatter={(tick: string) => tick.split("-")[2] ?? ""}
        />
        <Bar dataKey={valueKey} fill="hsl(var(--primary))" opacity={1} />
      </BarChart>
    </ResponsiveContainer>
  );
}
