import React, { useMemo, useCallback } from "react";
import { Tag } from "react-bulma-components";
import { DateTime } from "luxon";
import SelectField from "components/fields/selectField";

interface Props {
  doEntry: string | null;
  setDoEntry: (value: string | null) => void;
}

const DOEntryField = ({ doEntry, setDoEntry }: Props): React.ReactElement => {
  interface DOEntryOption {
    value: string;
    label: string;
    month: string;
  }

  const termOptions: DOEntryOption[] = useMemo(
    () =>
      [0, -1, -2, -3, -4, -5, -6, -7, -8]
        .map((yearDiff): DOEntryOption[] => {
          const year = yearDiff + DateTime.local().year;
          return [
            {
              value: `${year + 1}-01-01`,
              label: `${year}-${year + 1} Term 2`,
              month: `Jan ${year + 1}`,
            },
            {
              value: `${year}-09-01`,
              label: `${year}-${year + 1} Term 1`,
              month: `Sept ${year}`,
            },
          ];
        })
        .flat(),
    []
  );

  const selectedTerm: DOEntryOption | null = useMemo(() => {
    if (doEntry && /^\d{4}-0(1|9)-01$/.test(doEntry)) {
      const [year, month] = doEntry.split("-").map((s) => parseInt(s, 10));
      if (month === 1) {
        return {
          value: doEntry,
          label: `${year - 1}-${year} Term 2`,
          month: `Jan ${year}`,
        };
      }
      return {
        value: doEntry,
        label: `${year}-${year + 1} Term 1`,
        month: `Sept ${year}`,
      };
    }
    return null;
  }, [doEntry]);

  const formatTermOptionLabel = useCallback(
    ({ label, month }: DOEntryOption) => (
      <div className="is-flex">
        <div>{label}</div>
        {month && (
          <Tag className="ml-2" color="info">
            {month}
          </Tag>
        )}
      </div>
    ),
    []
  );

  const onChange = useCallback(
    (input: DOEntryOption | null) => setDoEntry(input?.value ?? null),
    [setDoEntry]
  );

  return (
    <SelectField
      label="Year of Entry"
      selectedOption={selectedTerm}
      options={termOptions}
      inputValue={doEntry}
      onChange={onChange}
      formatOptionLabel={formatTermOptionLabel}
      required
    />
  );
};

export default DOEntryField;
