import { DatePicker } from "@nextui-org/date-picker/dist";
import {
  now,
  today,
  getLocalTimeZone,
  dateTimeToString,
  ZonedDateTime,
} from "@internationalized/date";
import { useState } from "react";

export default function DateTimePicker({
  name,
  onSetDate,
}: {
  name: string;
  onSetDate: (date: ZonedDateTime) => void;
}) {
  let defaultDate = now(getLocalTimeZone());
  const [datetime, setDatetime] = useState(defaultDate);

  const handleDatetimeChange = (selectedDate) => {
    setDatetime(selectedDate); // Directly set the selected date
    onSetDate(selectedDate); // Pass date to parent component
  };

  return (
    <div className="col-span-3 gap-4 w-full max-w-xl">
      <div>
        <DatePicker
          label="Due Date"
          variant="bordered"
          isRequired
          hideTimeZone
          showMonthAndYearPickers
          minValue={today(getLocalTimeZone())}
          defaultValue={defaultDate}
          onChange={handleDatetimeChange}
        />
      </div>

      <input
        type="hidden"
        name={name}
        value={dateTimeToString(datetime)}
      ></input>
    </div>
  );
}
