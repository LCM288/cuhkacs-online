/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback, useEffect } from "react";
import { Form } from "react-bulma-components";
import DateField from "components/fields/dateField";
import { toast } from "react-toastify";

const { Checkbox, Field, Control } = Form;

interface Props {
  label: string;
  gradDate: string | null;
  dateValue: string | null;
  setDateValue: (value: string) => void;
  editable?: boolean;
  future?: boolean;
}

const MemberUntilField = ({
  label,
  gradDate,
  dateValue,
  setDateValue,
  editable = false,
  future = false,
}: Props): React.ReactElement => {
  const [untilGrad, setUntilGrad] = useState(dateValue === gradDate);

  useEffect(() => {
    if (untilGrad && gradDate) {
      setDateValue(gradDate);
    }
  }, [gradDate, untilGrad, setDateValue]);

  const onCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        if (!gradDate) {
          console.error("No graduation date specified.");
          toast.error("Some error has occurred.");
          return;
        }
        setDateValue(gradDate);
        setUntilGrad(true);
      } else {
        setUntilGrad(false);
      }
    },
    [setDateValue, gradDate]
  );

  return (
    <>
      <DateField
        label={label}
        dateValue={dateValue}
        setDateValue={setDateValue}
        editable={!untilGrad && editable}
        required
        yearRange={[-10, 10]}
        future={future}
      />
      <Field>
        <Control>
          <Checkbox
            onChange={onCheckboxChange}
            checked={untilGrad}
            disabled={!editable || !gradDate}
          >
            Until Gradutation
          </Checkbox>
        </Control>
      </Field>
    </>
  );
};

export default MemberUntilField;
