import { DatePicker } from "@nextui-org/react";

export default function BirthDatePicker() {
  return (
    <div className="flex flex-row gap-4 w-full max-w-xl">
      <DatePicker
        label="Birth Date"
        variant="bordered"
        isRequired
        showMonthAndYearPickers
      />
    </div>
  );
}
