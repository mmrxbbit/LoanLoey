import { DatePicker } from "@nextui-org/react";
import { now, getLocalTimeZone } from "@internationalized/date";

export default function DateTimePicker() {
  return (
    <div className="flex flex-row gap-4 w-full max-w-xl">
      <DatePicker
        label="Due Date"
        variant="bordered"
        hideTimeZone
        showMonthAndYearPickers
        defaultValue={now(getLocalTimeZone())}
      />
    </div>
  );
}
