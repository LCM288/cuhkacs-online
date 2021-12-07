import React, { useState, useCallback, useMemo } from "react";
import Loading from "components/loading";
import TextField from "components/fields/textField";
import DOEntryField from "components/fields/doEntryField";
import CollegeField from "components/fields/collegeField";
import DOGradField from "components/fields/doGradField";
import GenderField from "components/fields/genderField";
import DateField from "components/fields/dateField";
import MemberUntilField from "components/fields/memberUntilField";
import MajorField from "components/fields/majorField";
import { Modal, Button, Heading } from "react-bulma-components";
import { PreventDefaultForm } from "utils/domEventHelpers";
import { RegistrationListRow, MemberListRow } from "types/tableRow";

export type UpdatedMember = {
  sid: string;
  name: {
    chi: string | null;
    eng: string;
  };
  gender: string | null;
  dob: string | null;
  email: string | null;
  phone: string | null;
  studentStatus: {
    college: string | null;
    major: string | null;
    entryDate: string | null;
    gradDate: string | null;
  };
  memberStatus:
    | {
        until: string;
      }
    | undefined;
};

interface Props {
  onSave: (newData: UpdatedMember) => void;
  onCancel: () => void;
  row: RegistrationListRow | MemberListRow;
  loading: boolean;
  type: "Registration" | "Member";
  fullyEditable?: boolean;
}

const EditMemberModal = ({
  onSave,
  onCancel,
  row,
  loading,
  type,
  fullyEditable = false,
}: Props): React.ReactElement => {
  const [sid, setSID] = useState(row.sid);
  const [englishName, setEnglishName] = useState(row.englishName);
  const [chineseName, setChineseName] = useState(row.chineseName ?? "");
  const [gender, setGender] = useState(row.gender ?? null);
  const [dob, setDob] = useState(row.dateOfBirth ?? null);
  const [email, setEmail] = useState(row.email ?? `${sid}@link.cuhk.edu.hk`);
  const [phone, setPhone] = useState(row.phone ?? "");
  const [collegeCode, setCollegeCode] = useState<string | null>(row.college);
  const [majorCode, setMajorCode] = useState<string | null>(row.major);
  const [doEntry, setDoEntry] = useState<string | null>(row.dateOfEntry);
  const [doGrad, setDoGrad] = useState<string | null>(
    row.expectedGraduationDate
  );
  const memberSince = useMemo(
    () => ("memberSince" in row ? row.memberSince : null),
    [row]
  );
  const [memberUntil, setMemberUntil] = useState(
    "memberUntil" in row ? row.memberUntil : null
  );

  const onReset = useCallback(() => {
    setSID(row.sid);
    setEnglishName(row.englishName);
    setChineseName(row.chineseName ?? "");
    setGender(row.gender ?? null);
    setDob(row.dateOfBirth ?? null);
    setEmail(row.email ?? `${row.sid}@link.cuhk.edu.hk`);
    setPhone(row.phone ?? "");
    setCollegeCode(row.college);
    setMajorCode(row.major);
    setDoEntry(row.dateOfEntry);
    setDoGrad(row.expectedGraduationDate);
    setMemberUntil("memberUntil" in row ? row.memberUntil : null);
  }, [row]);

  const onConfirm = useCallback(
    (newData: UpdatedMember) => {
      onSave(newData);
    },
    [onSave]
  );

  return (
    <>
      <Modal show closeOnEsc={false} showClose={false} onClose={onCancel}>
        <Modal.Content className="has-background-white box">
          <PreventDefaultForm
            onSubmit={() =>
              onConfirm({
                sid,
                name: {
                  eng: englishName,
                  chi: chineseName || null,
                },
                gender: gender || null,
                dob: dob || null,
                email: email || null,
                phone: phone || null,
                studentStatus: {
                  college: collegeCode,
                  major: majorCode,
                  entryDate: doEntry,
                  gradDate: doGrad,
                },
                memberStatus:
                  memberSince && memberUntil
                    ? {
                        until: memberUntil,
                      }
                    : undefined,
              })
            }
          >
            <>
              <Heading className="has-text-centered">Edit {type}</Heading>
              <TextField
                value={sid}
                setValue={setSID}
                label="Student ID"
                editable={fullyEditable}
                pattern="^\d{10}$"
                required
              />
              <TextField
                value={englishName}
                setValue={setEnglishName}
                label="English Name"
                placeholder="English Name as in CU Link Card"
                editable
                required
              />
              <TextField
                value={chineseName}
                setValue={setChineseName}
                label="Chinese Name"
                placeholder="Chinese Name as in CU Link Card"
                editable
              />
              <GenderField gender={gender} setGender={setGender} />
              <DateField
                label="Date of Birth"
                dateValue={dob}
                setDateValue={setDob}
                editable
              />
              <TextField
                value={email}
                setValue={setEmail}
                label="Email"
                placeholder="Email address"
                type="email"
                editable
              />
              <TextField
                value={phone}
                setValue={setPhone}
                label="Phone Number"
                placeholder="Phone Number"
                type="tel"
                pattern="\+?\d+(-\d+)*"
                editable
              />
              <CollegeField
                collegeCode={collegeCode}
                setCollegeCode={setCollegeCode}
              />
              <MajorField majorCode={majorCode} setMajorCode={setMajorCode} />
              <DOEntryField doEntry={doEntry} setDoEntry={setDoEntry} />
              <DOGradField doGrad={doGrad} setDoGrad={setDoGrad} />
              {type === "Member" && (
                <>
                  <DateField label="Member Since" dateValue={memberSince} />
                  <MemberUntilField
                    label="Member Until"
                    gradDate={doGrad}
                    dateValue={memberUntil}
                    setDateValue={setMemberUntil}
                    editable={fullyEditable}
                  />
                </>
              )}
              <div className="is-pulled-right buttons pt-4">
                <Button type="button" onClick={onReset} color="warning">
                  Reset
                </Button>
                <Button type="submit" color="primary">
                  Confirm
                </Button>
                <Button type="button" color="danger" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </>
          </PreventDefaultForm>
        </Modal.Content>
        <Loading loading={loading} />
      </Modal>
    </>
  );
};

export default EditMemberModal;
