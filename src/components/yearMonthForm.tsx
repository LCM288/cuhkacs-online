import React, { useMemo, useCallback } from "react";
import { Form } from "react-bulma-components";
import { DateTime, Info } from "luxon";

const { Select } = Form;

interface Props {
  date: Date;
  onChange: (month: Date) => void;
  yearRange: number[];
}

const YearMonthForm = ({
  date,
  onChange,
  yearRange: [from, to],
}: Props): React.ReactElement => {
  const months = useMemo(() => Info.months("long"), []);

  const years = useMemo(
    () =>
      Array.from(
        { length: to - from + 1 },
        (_, i) => i + DateTime.local().plus({ year: from }).year
      ),
    [from, to]
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const { year, month } = event.target.form as HTMLFormElement;
      onChange(new Date(year.value, month.value));
    },
    [onChange]
  );

  return (
    <div className="DayPicker-Caption">
      <Select
        name="month"
        onChange={handleChange}
        value={DateTime.fromJSDate(date).month - 1}
        size="small"
      >
        {months.map((month, i) => (
          <option key={month} value={i}>
            {month}
          </option>
        ))}
      </Select>
      <Select
        name="year"
        onChange={handleChange}
        value={DateTime.fromJSDate(date).year}
        size="small"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default YearMonthForm;
