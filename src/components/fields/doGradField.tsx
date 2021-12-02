import React, { useMemo, useCallback } from "react";
import { Tag } from "react-bulma-components";
import { DateTime } from "luxon";
import SelectField from "components/fields/selectField";

interface Props {
  doGrad: string | null;
  setDoGrad: (value: string | null) => void;
}

const DOGradField = ({ doGrad, setDoGrad }: Props): React.ReactElement => {
  interface DOGradOption {
    value: string;
    label: string;
    month: string;
  }

  const termOptions: DOGradOption[] = useMemo(
    () =>
      [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8]
        .map((yearDiff: number): DOGradOption[] => {
          const year = yearDiff + DateTime.local().year;
          // `value` corresponds to the date where student status becomes ineffective
          return [
            {
              value: `${year + 1}-01-01`,
              label: `${year}-${year + 1} Term 1`,
              month: `Dec ${year}`,
            },
            {
              value: `${year + 1}-08-01`,
              label: `${year}-${year + 1} Term 2`,
              month: `Jul ${year + 1}`,
            },
          ];
        })
        .flat(),
    []
  );

  const selectedTerm: DOGradOption | null = useMemo(() => {
    if (doGrad) {
      const [year, month] = doGrad.split("-").map((s) => parseInt(s, 10));
      if (month === 1) {
        return {
          value: doGrad,
          label: `${year - 1}-${year} Term 1`,
          month: `Dec ${year - 1}`,
        };
      } else if (month === 8) {
        return {
          value: doGrad,
          label: `${year - 1}-${year} Term 2`,
          month: `Jul ${year}`,
        };
      } else {
        return { value: doGrad, label: doGrad, month: "" };
      }
    }
    return null;
  }, [doGrad]);

  const formatTermOptionLabel = useCallback(
    ({ label, month }: DOGradOption) => (
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
    (input: DOGradOption | null) => setDoGrad(input?.value ?? null),
    [setDoGrad]
  );

  return (
    <SelectField
      label="Expected Graduation Year"
      selectedOption={selectedTerm}
      options={termOptions}
      inputValue={doGrad}
      onChange={onChange}
      formatOptionLabel={formatTermOptionLabel}
      required
    />
  );
};

export default DOGradField;
