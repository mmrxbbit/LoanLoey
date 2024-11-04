import { DatePicker } from "@nextui-org/react";
import { now, getLocalTimeZone } from "@internationalized/date";

export default function App() {
  return (
    <div className="flex flex-row gap-4 w-full max-w-xl">
      <DatePicker
        label="Event Date"
        variant="bordered"
        hideTimeZone
        showMonthAndYearPickers
        defaultValue={now(getLocalTimeZone())}
      />
    </div>
  );
}
