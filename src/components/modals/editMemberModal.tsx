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
import { Member } from "types/db";
import { DateTime } from "luxon";
import { CollegeCode } from "static/college.json";

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
    college: CollegeCode | null;
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
  member: Member;
  loading: boolean;
  type: "Registration" | "Member";
  fullyEditable?: boolean;
}

const EditMemberModal = ({
  onSave,
  onCancel,
  member,
  loading,
  type,
  fullyEditable = false,
}: Props): React.ReactElement => {
  const [sid, setSID] = useState(member.sid);
  const [englishName, setEnglishName] = useState(member.name.eng);
  const [chineseName, setChineseName] = useState(member.name.chi ?? "");
  const [gender, setGender] = useState(member.gender ?? null);
  const [dob, setDob] = useState(member.dob ?? null);
  const [email, setEmail] = useState(member.email ?? `${sid}@link.cuhk.edu.hk`);
  const [phone, setPhone] = useState(member.phone ?? "");
  const [collegeCode, setCollegeCode] = useState<CollegeCode | null>(
    member.studentStatus.college
  );
  const [majorCode, setMajorCode] = useState<string | null>(
    member.studentStatus.major
  );
  const [doEntry, setDoEntry] = useState<string | null>(
    member.studentStatus.entryDate
  );
  const [doGrad, setDoGrad] = useState<string | null>(
    member.studentStatus.gradDate
  );
  const memberSince = useMemo(
    () =>
      member.memberStatus?.since
        ? DateTime.fromMillis(member.memberStatus.since, {
            zone: "Asia/Hong_Kong",
          }).toISODate()
        : null,
    [member]
  );
  const [memberUntil, setMemberUntil] = useState(
    member.memberStatus?.until
      ? DateTime.fromMillis(member.memberStatus.until, {
          zone: "Asia/Hong_Kong",
        }).toISODate()
      : null
  );

  const onReset = useCallback(() => {
    setSID(member.sid);
    setEnglishName(member.name.eng);
    setChineseName(member.name.chi ?? "");
    setGender(member.gender ?? null);
    setDob(member.dob ?? null);
    setEmail(member.email ?? `${member.sid}@link.cuhk.edu.hk`);
    setPhone(member.phone ?? "");
    setCollegeCode(member.studentStatus.college);
    setMajorCode(member.studentStatus.major);
    setDoEntry(member.studentStatus.entryDate);
    setDoGrad(member.studentStatus.gradDate);
    setMemberUntil(
      member.memberStatus?.until
        ? DateTime.fromMillis(member.memberStatus.until, {
            zone: "Asia/Hong_Kong",
          }).toISODate()
        : null
    );
  }, [member]);

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
                pattern="\d*"
                maxLength={16}
                label="Student ID"
                editable={fullyEditable}
                required
              />
              <TextField
                value={englishName}
                setValue={setEnglishName}
                label="English Name"
                maxLength={128}
                placeholder="English Name as in CU Link Card"
                editable
                required
              />
              <TextField
                value={chineseName}
                setValue={setChineseName}
                label="Chinese Name"
                maxLength={64}
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
                pattern=".+@.+"
                maxLength={324}
                editable
              />
              <TextField
                value={phone}
                setValue={setPhone}
                label="Phone Number"
                placeholder="Phone Number"
                type="tel"
                pattern="\+?\d+(-\d+)*"
                maxLength={64}
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
                    editable
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
