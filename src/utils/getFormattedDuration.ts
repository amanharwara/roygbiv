import dayjs from "dayjs";
import dayjsObject from "dayjs/plugin/objectSupport";
dayjs.extend(dayjsObject);

export const getFormattedDuration = (duration: number) => {
  return dayjs({
    seconds: duration,
  }).format(duration >= 3600 ? "HH:mm:ss" : "mm:ss");
};
