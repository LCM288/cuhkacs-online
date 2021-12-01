import React, { useMemo, useCallback } from "react";
import { Level } from "react-bulma-components";
import SelectField from "components/fields/selectField";
import collegeData, { College } from "static/college.json";

interface Props {
  collegeCode: string | null;
  setCollegeCode: (value: string | null) => void;
}

const CollegeField = ({
  collegeCode,
  setCollegeCode,
}: Props): React.ReactElement => {
  type CollegeOption = {
    value: string;
    chineseLabel: string;
    englishLabel: string;
  };

  const collegeOpions: CollegeOption[] = useMemo(
    () =>
      collegeData.colleges.map(
        ({
          code: value,
          englishName: englishLabel,
          chineseName: chineseLabel,
        }: College) => ({
          value,
          chineseLabel,
          englishLabel,
        })
      ),
    []
  );

  const selectedCollege = useMemo(
    () => collegeOpions.find(({ value }) => value === collegeCode) ?? null,
    [collegeOpions, collegeCode]
  );

  const formatCollegeOptionLabel = useCallback(
    ({ chineseLabel, englishLabel }: CollegeOption) => (
      <Level className="is-mobile is-flex-wrap-wrap">
        <Level.Side align="left" className="is-flex-wrap-wrap is-flex-shrink-1">
          <Level.Item className="is-flex-shrink-1 is-flex-grow-0">
            {englishLabel}
          </Level.Item>
          <Level.Item className="is-flex-shrink-1 is-flex-grow-0">
            {chineseLabel}
          </Level.Item>
        </Level.Side>
        <div />
      </Level>
    ),
    []
  );

  const filterOption = useCallback(
    (
      {
        value,
        data: { chineseLabel, englishLabel },
      }: { value: string; data: CollegeOption },
      rawInput: string
    ) => {
      return (
        value.toLowerCase().includes(rawInput.toLowerCase()) ||
        chineseLabel?.toLowerCase().includes(rawInput.toLowerCase()) ||
        englishLabel?.toLowerCase().includes(rawInput.toLowerCase())
      );
    },
    []
  );

  const onChange = useCallback(
    (input: CollegeOption | null) => setCollegeCode(input?.value ?? null),
    [setCollegeCode]
  );

  return (
    <SelectField
      label="College"
      selectedOption={selectedCollege}
      options={collegeOpions}
      inputValue={collegeCode}
      onChange={onChange}
      filterOption={filterOption}
      formatOptionLabel={formatCollegeOptionLabel}
      required
    />
  );
};

export default CollegeField;
