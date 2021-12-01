/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useCallback } from "react";
import { Form } from "react-bulma-components";
import DateField from "components/fields/dateField";

const { Checkbox } = Form;

interface Props {
  label: string;
  nullLabel: string | null;
  dateValue: string | null;
  setDateValue: (value: string | null) => void;
  editable?: boolean;
}

const MemberUntilField = ({
  label,
  nullLabel = null,
  dateValue,
  setDateValue,
  editable = false,
}: Props): React.ReactElement => {
  const [isNull, setIsNull] = useState(dateValue === null);
  const [stringValue, setStringValue] = useState((dateValue ?? "") as string);

  const onNullChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setDateValue(null);
        setIsNull(true);
      } else {
        setIsNull(false);
      }
    },
    [setDateValue]
  );

  const setStringValueCallback = useCallback(
    (string: string) => {
      setDateValue(isNull ? null : string);
      setStringValue(string);
    },
    [setDateValue, isNull]
  );

  return (
    <>
      <DateField
        label={label}
        dateValue={stringValue}
        setDateValue={setStringValueCallback}
        editable={!isNull && editable}
        required={!isNull}
        yearRange={[-10, 10]}
      />
      <Checkbox onChange={onNullChange} checked={isNull} disabled={!editable}>
        {` ${nullLabel}`}
      </Checkbox>
    </>
  );
};

export default MemberUntilField;
