import React, { useMemo, useCallback } from "react";
import SelectField from "components/fields/selectField";

interface Props {
  gender: string | null;
  setGender: (value: string | null) => void;
}

const GenderField = ({ gender, setGender }: Props): React.ReactElement => {
  interface GenderOption {
    value: string;
    label: string;
  }

  const genderOptions: GenderOption[] = useMemo(
    () => [
      {
        value: "male",
        label: "Male",
      },
      {
        value: "female",
        label: "Female",
      },
      {
        value: "other",
        label: "Other / Prefer not to say",
      },
    ],
    []
  );

  const selectedGender = useMemo(
    () => genderOptions.find(({ value }) => value === gender) ?? null,
    [genderOptions, gender]
  );

  const onChange = useCallback(
    (input: GenderOption | null) => setGender(input?.value ?? null),
    [setGender]
  );

  return (
    <SelectField
      label="Gender"
      selectedOption={selectedGender}
      options={genderOptions}
      inputValue={gender}
      onChange={onChange}
      required
    />
  );
};

export default GenderField;
