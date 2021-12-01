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

  const defaultOption = useMemo(
    () => ({
      value: "other",
      label: "Other / Prefer not to say",
    }),
    []
  );

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
      defaultOption,
    ],
    [defaultOption]
  );

  const selectedGender = useMemo(
    () => genderOptions.find(({ value }) => value === gender) ?? defaultOption,
    [genderOptions, gender, defaultOption]
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
      defaultOption={defaultOption}
      required
    />
  );
};

export default GenderField;
