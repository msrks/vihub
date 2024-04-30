import ChartCard from "./_components/ChartCard";
import { RANGE_OPTIONS, getRangeOption } from "@/lib/rangeOptions";
import { CustomBarChart } from "./_components/charts/customBarChart";
import { CustomLineChart } from "./_components/charts/customLineChart";
import { api } from "@/trpc/server";
import { CustomPieChart } from "./_components/charts/customPieChart";
import { eachDayOfInterval, formatDate, interval } from "date-fns";

export default async function Page({
  params: { workspaceName, imageStoreName },
  searchParams: { range, rangeFrom, rangeTo },
}: {
  params: { workspaceName: string; imageStoreName: string };
  searchParams: { range?: string; rangeFrom?: string; rangeTo?: string };
}) {
  const rangeOption =
    getRangeOption(range, rangeFrom, rangeTo) ?? RANGE_OPTIONS.last_7_days;

  const imageStore = await api.imageStore.getByName({
    workspaceName,
    imageStoreName,
  });

  const _data = await api.image.getAllCountsPerLabelPerDate({
    imageStoreId: imageStore.id,
  });

  // if (_data.length === 0) {
  //   return <div>No data</div>;
  // }

  const array = eachDayOfInterval(
    interval(
      rangeOption.startDate ?? new Date(),
      rangeOption.endDate ?? new Date(),
    ),
  );

  const data = array.map((date) => {
    const item = _data.find((d) => d.date === formatDate(date, "yyyy-MM-dd"));
    if (item) return item;
    return {
      date: formatDate(date, "yy/MM/dd"),
      count: 0,
    };
  });

  // const { array, format } = getChartDateArray(
  //   rangeOption.startDate ??
  //     startOfDay(parse(_data[0]!.date, "yyyy-MM-dd", new Date())),
  //   rangeOption.endDate ?? new Date(),
  // );

  // const dayArray = array.map((date) => {
  //   return {
  //     date: format(date),
  //     count: 0,
  //   };
  // });

  // const data = _data.reduce((acc, curr) => {
  //   const formattedDate = format(parse(curr.date, "yyyy-MM-dd", new Date()));
  //   const entry = dayArray.find((d) => d.date === formattedDate);
  //   if (!entry) return acc;
  //   entry.count += curr.count;
  //   return acc;
  // }, dayArray);

  const allLabels = await api.labelClass.getAll({
    imageStoreId: imageStore.id,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
      {/* <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre> */}
      <ChartCard
        title="All Images"
        queryKey="range"
        selectedRangeLabel="range"
        heroValue={data.reduce((acc, curr) => acc + curr.count, 0)}
        heroDescription="{+XX}% from last month"
      >
        <div className="mt-4 h-[130px]">
          <CustomBarChart data={data} valueKey="count" />
        </div>
      </ChartCard>

      {allLabels.map((label) => (
        <ChartCard
          key={label.id}
          title={`${label.displayName}s (AI Label)`}
          queryKey="range"
          selectedRangeLabel="range"
          heroValue={data.reduce(
            (acc, curr) => acc + curr[label.key as "count"],
            0,
          )}
          heroDescription="{+XX}% from last month"
        >
          <div className="h-[130px]">
            <CustomBarChart data={data} valueKey={label.key} />
          </div>
        </ChartCard>
      ))}

      <ChartCard
        title={`Label Ratio`}
        queryKey="range"
        selectedRangeLabel="range"
      >
        <div className="h-[130px]">
          <CustomPieChart
            data={allLabels.map((label) => ({
              name: label.key,
              value: data
                .filter((d) => d[label.key as "count"])
                .reduce((acc, curr) => acc + curr[label.key as "count"], 0),
            }))}
            valueKey="value"
          />
        </div>
      </ChartCard>

      {allLabels.map((label) => {
        const stats = data.reduce(
          (acc, curr) => ({
            total: acc.total + curr.count,
            val: acc.val + curr[label.key as "count"],
          }),
          { total: 0, val: 0 },
        );

        return (
          <ChartCard
            key={label.id}
            title={`${label.displayName}s (AI Label)`}
            queryKey="range"
            selectedRangeLabel="range"
            heroValue={(stats.val / stats.total).toFixed(2)}
            heroDescription="{+XX}% from last month"
          >
            <div className="h-[130px]">
              <CustomLineChart
                data={data.map((d) => ({
                  ...d,
                  val: d[label.key as "count"] / d.count,
                }))}
                valueKey="val"
              />
            </div>
          </ChartCard>
        );
      })}
    </div>
  );
}
