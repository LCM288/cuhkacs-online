import React, { useMemo, useCallback } from "react";
import { Tag, Level } from "react-bulma-components";
import majorData, { Major } from "static/major.json";
import facultyData, { Faculty } from "static/faculty.json";
import SelectField from "components/fields/selectField";

interface Props {
  majorCode: string | null;
  setMajorCode: (value: string | null) => void;
}

const MajorField = ({ majorCode, setMajorCode }: Props): React.ReactElement => {
  interface MajorOption {
    value: string;
    chineseLabel: string;
    englishLabel: string;
    faculties: { value: string; chineseLabel: string; englishLabel: string }[];
  }

  const majorOptions: MajorOption[] = useMemo(
    () =>
      majorData.majors.map((majorProgram: Major) => ({
        value: majorProgram.code,
        chineseLabel: majorProgram.chineseName,
        englishLabel: majorProgram.englishName,
        faculties: majorProgram.faculties.flatMap((facultyCode: string) => {
          const faculty = facultyData.faculties.find(
            ({ code }: Faculty) => code === facultyCode
          );
          return faculty
            ? [
                {
                  value: faculty.code,
                  chineseLabel: faculty.chineseName,
                  englishLabel: faculty.englishName,
                },
              ]
            : [];
        }),
      })) ?? [],
    []
  );

  const selectedMajor = useMemo(
    () => majorOptions.find(({ value }) => value === majorCode) ?? null,
    [majorOptions, majorCode]
  );

  const facultyColor = useMemo<{
    [index: string]: { color: string; isLight: boolean };
  }>(
    () => ({
      ART: { color: "dark", isLight: false },
      BAF: { color: "info", isLight: false },
      EDU: { color: "danger", isLight: false },
      ENF: { color: "primary", isLight: false },
      SLAW: { color: "light", isLight: false },
      MED: { color: "success", isLight: false },
      SCF: { color: "warning", isLight: false },
      SSF: { color: "link", isLight: false },
      DDP: { color: "danger", isLight: true },
      IDM: { color: "primary", isLight: true },
    }),
    []
  );

  const formatMajorOptionLabel = useCallback(
    ({ chineseLabel, englishLabel, faculties }: MajorOption) => (
      <Level className="is-mobile is-flex-wrap-wrap">
        <Level.Side align="left" className="is-flex-wrap-wrap is-flex-shrink-1">
          <Level.Item className="is-flex-shrink-1 is-flex-grow-0">
            {englishLabel}
          </Level.Item>
          <Level.Item className="is-flex-shrink-1 is-flex-grow-0">
            {chineseLabel}
          </Level.Item>
        </Level.Side>
        <Level.Side
          align="right"
          className="is-flex-wrap-wrap is-flex-shrink-1"
          style={{ marginLeft: "auto", width: "max-content" }}
        >
          {faculties.map((faculty) => (
            <Level.Item
              key={faculty.value}
              className="is-flex-shrink-1 is-flex-grow-0 has-tag mr-0"
              style={{ width: "100%" }}
            >
              <Tag
                className={`ml-2 has-text-weight-medium py-1 ${
                  facultyColor[faculty.value].isLight ? "is-light" : ""
                }`}
                color={facultyColor[faculty.value].color}
                style={{
                  flexWrap: "wrap",
                  height: "unset",
                  minHeight: "2em",
                  width: "100%",
                }}
              >
                <span className="mr-1">{faculty.chineseLabel}</span>
                <span>{faculty.englishLabel}</span>
              </Tag>
            </Level.Item>
          ))}
        </Level.Side>
      </Level>
    ),
    [facultyColor]
  );

  const filterOption = useCallback(
    (
      {
        value,
        data: { chineseLabel, englishLabel },
      }: { value: string; data: MajorOption },
      rawInput: string
    ) => {
      return (
        value.toLowerCase().includes(rawInput.toLowerCase()) ||
        chineseLabel.toLowerCase().includes(rawInput.toLowerCase()) ||
        englishLabel.toLowerCase().includes(rawInput.toLowerCase())
      );
    },
    []
  );

  const onChange = useCallback(
    (input: MajorOption | null) => setMajorCode(input?.value ?? null),
    [setMajorCode]
  );

  return (
    <SelectField
      label="Major"
      selectedOption={selectedMajor}
      options={majorOptions}
      inputValue={majorCode}
      onChange={onChange}
      filterOption={filterOption}
      formatOptionLabel={formatMajorOptionLabel}
      required
    />
  );
};

export default MajorField;
