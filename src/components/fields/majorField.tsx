import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Tag, Level } from "react-bulma-components";
import majorData, { Major } from "static/major.json";
import facultyData, { Faculty, I18nString } from "static/faculty.json";
import SelectField from "components/fields/selectField";
import TextField from "components/fields/textField";
import { lengthLimits } from "utils/memberUtils";

interface Props {
  majorCode: string | null;
  setMajorCode: (value: string | null) => void;
}

interface MajorOption {
  value: string;
  chineseLabel: string;
  englishLabel: string;
  faculties: { value: string; labels: I18nString[] }[];
  // True for programmes no longer in RES list
  // TODO: handling inactive programmes: https://github.com/LCM288/cuhkacs-online/issues/3
  inactive?: boolean;
}

const othersOption: MajorOption = {
  value: "OTHER",
  englishLabel: "Other Programmes (Please specify)",
  chineseLabel: "其他課程（請註明）",
  faculties: [],
};

// TODO: Move faculty label logic to display
// TODO: fetch (potential) new admission/programmes from CUHK Admission
const MajorField = ({ majorCode, setMajorCode }: Props): React.ReactElement => {
  const majorOptions: MajorOption[] = useMemo(
    () =>
      (
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
                    labels: faculty.labels,
                  },
                ]
              : [];
          }),
        })) ?? []
      ).concat([othersOption]),
    []
  );

  const [isOthers, setIsOthers] = useState(false);
  const [localMajorCode, setLocalMajorCode] = useState<string | null>(null);

  useEffect(() => {
    if (localMajorCode !== majorCode) {
      setLocalMajorCode(majorCode);
      setIsOthers(!majorOptions.find(({ value }) => value === majorCode));
    }
  }, [localMajorCode, majorCode, majorOptions]);

  const selectedMajor: MajorOption | null = useMemo(
    () =>
      isOthers
        ? othersOption
        : typeof majorCode === "string"
        ? majorOptions.find(({ value }) => value === majorCode) ?? othersOption
        : null,
    [majorOptions, majorCode, isOthers]
  );

  //TODO: move styling to JSON
  const facultyColors = useMemo<{
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
            >
              <Tag
                className={`ml-2 has-text-weight-medium py-1 ${
                  facultyColors[faculty.value].isLight ? "is-light" : ""
                }`}
                color={facultyColors[faculty.value].color}
                style={{
                  gap: "0.25rem",
                }}
              >
                {Object.values(faculty.labels).map((label) => (
                  <span>{label}</span>
                ))}
              </Tag>
            </Level.Item>
          ))}
        </Level.Side>
      </Level>
    ),
    [facultyColors]
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
    (input: MajorOption | null) => {
      if (input === othersOption) {
        setMajorCode("");
        setLocalMajorCode("");
        setIsOthers(true);
      } else {
        setMajorCode(input?.value ?? null);
        setLocalMajorCode(input?.value ?? null);
        setIsOthers(false);
      }
    },
    [setMajorCode]
  );

  return (
    <>
      <SelectField
        label="Major"
        selectedOption={selectedMajor}
        options={majorOptions}
        inputValue={
          typeof majorCode === "string" ? (majorCode ? majorCode : " ") : null
        }
        onChange={onChange}
        filterOption={filterOption}
        formatOptionLabel={formatMajorOptionLabel}
        required
      />
      {isOthers && (
        <TextField
          label=""
          value={majorCode ?? ""}
          setValue={setMajorCode}
          maxLength={lengthLimits.studentStatus.major}
          editable
          required
        />
      )}
    </>
  );
};

export default MajorField;
