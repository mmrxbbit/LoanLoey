import { DatePicker } from "@nextui-org/react";
import {
  now,
  getLocalTimeZone,
  DateFormatter,
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

  function dateTimeToString(dateTime) {
    const nativeDate = new Date(
      dateTime.year,
      dateTime.month - 1, // JS months are 0-based
      dateTime.day,
      dateTime.hour,
      dateTime.minute,
      dateTime.second
    );

    const formatter = new DateFormatter("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(nativeDate);
  }

  return (
    <>
      <div className="gap-4 w-full max-w-xl">
        <DatePicker
          label="Due Date"
          variant="bordered"
          isRequired
          hideTimeZone
          showMonthAndYearPickers
          minValue={defaultDate}
          defaultValue={defaultDate}
          onChange={handleDatetimeChange}
        />

        <input
          type="hidden"
          name={name}
          value={dateTimeToString(datetime)}
        ></input>
      </div>
    </>
  );
}
