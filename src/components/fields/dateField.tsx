import React, { useState } from "react";
import { Form } from "react-bulma-components";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { DateTime } from "luxon";
import YearMonthForm from "components/yearMonthForm";

const { Input, Field, Control, Label } = Form;

interface Props {
  label: string;
  dateValue: string | null;
  setDateValue?: (value: string) => void;
  editable?: boolean;
  yearRange?: number[];
  future?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  hideLabel?: boolean;
}

const DateField = ({
  label,
  dateValue,
  setDateValue = () => {},
  editable = false,
  future = false,
  yearRange = [-30, 0],
  required = false,
  autoFocus,
  hideLabel,
}: Props): React.ReactElement => {
  const [calMonth, setCalMonth] = useState(new Date());

  return (
    <Field>
      {!hideLabel && (
        <Label>
          {label}
          {required && " *"}
        </Label>
      )}
      <Control>
        <DayPickerInput
          component={(props: unknown) => (
            <Input
              {...props}
              disabled={!editable}
              required={required}
              pattern="^\d{4}-\d{2}-\d{2}$"
            />
          )}
          inputProps={{ ref: null, autoFocus: autoFocus }}
          classNames={{
            container: "",
            overlayWrapper: "DayPickerInput-OverlayWrapper",
            overlay: "DayPickerInput-Overlay",
          }}
          format="yyyy-MM-dd"
          formatDate={(date: Date) => DateTime.fromJSDate(date).toISODate()}
          parseDate={(str: string, format: string) => {
            const day = DateTime.fromFormat(str, format);
            return day.isValid ? day.toJSDate() : undefined;
          }}
          value={dateValue ?? undefined}
          onDayChange={(date: Date) => {
            const dateTime = DateTime.fromJSDate(date);
            setDateValue(dateTime ? dateTime.toISODate() : "");
          }}
          placeholder="YYYY-MM-DD"
          dayPickerProps={{
            ...(future && { disabledDays: { before: new Date() } }),
            month: calMonth,
            captionElement: ({ date }: { date: Date }) => (
              <YearMonthForm
                date={date}
                onChange={(month: Date) => setCalMonth(month)}
                yearRange={yearRange}
              />
            ),
          }}
        />
      </Control>
    </Field>
  );
};

export default DateField;
