import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfWeek,
  formatDate,
  interval,
  max,
  min,
  startOfWeek,
} from "date-fns";

export function getChartDateArray(startDate: Date, endDate: Date = new Date()) {
  const days = differenceInDays(endDate, startDate);
  if (days < 30) {
    return {
      array: eachDayOfInterval(interval(startDate, endDate)),
      format: (date: Date) => formatDate(date, "yy/MM/dd"),
    };
  }

  const weeks = differenceInWeeks(endDate, startDate);
  if (weeks < 30) {
    return {
      array: eachWeekOfInterval(interval(startDate, endDate)),
      format: (date: Date) => {
        const start = max([startOfWeek(date), startDate]);
        const end = min([endOfWeek(date), endDate]);

        return `${formatDate(start, "yy/MM/dd")}-${formatDate(end, "MM/dd")}`;
      },
    };
  }

  const months = differenceInMonths(endDate, startDate);
  if (months < 30) {
    return {
      array: eachMonthOfInterval(interval(startDate, endDate)),
      format: (date: Date) => formatDate(date, "MMM yy"),
    };
  }

  return {
    array: eachYearOfInterval(interval(startDate, endDate)),
    format: (date: Date) => formatDate(date, "yyyy"),
  };
}
