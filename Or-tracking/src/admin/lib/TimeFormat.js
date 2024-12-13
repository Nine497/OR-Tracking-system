import dayjs from "dayjs";

export function formatTime(timeStr) {
  const dateToUse = dayjs().format("YYYY-MM-DD");
  const timeString = `${dateToUse}T${timeStr}`;
  return dayjs(timeString).format("hh:mm A");
}
