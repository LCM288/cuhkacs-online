import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Button, Section, Container, Heading } from "react-bulma-components";
import { Navigate, useNavigate } from "react-router-dom";
import DOEntryField from "components/fields/doEntryField";
import TextField from "components/fields/textField";
import CollegeField from "components/fields/collegeField";
import DOGradField from "components/fields/doGradField";
import GenderField from "components/fields/genderField";
import DateField from "components/fields/dateField";
import MajorField from "components/fields/majorField";
import Loading from "components/loading";
import { PreventDefaultForm } from "utils/domEventHelpers";
import useUserStatus from "utils/useUserStatus";
import PromptModal from "components/modals/promptModal";
import { useUpdate } from "utils/firebase";
import { serverTimestamp } from "firebase/database";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import { Member } from "types/db";
import type { CollegeCode } from "static/college.json";

const Register = (): React.ReactElement => {
  const userStatus = useUserStatus();
  const navigate = useNavigate();

  const [chineseName, setChineseName] = useState<string>("");
  const [gender, setGender] = useState<string | null>(null);
  const [dob, setDob] = useState<string | null>(null);
  const [email, setEmail] = useState(`${userStatus?.sid}@link.cuhk.edu.hk`);
  const [phone, setPhone] = useState<string>("");
  const [collegeCode, setCollegeCode] = useState<CollegeCode | null>(null);
  const [majorCode, setMajorCode] = useState<string | null>(null);
  const [doEntry, setDoEntry] = useState<string | null>(null);
  const [doGrad, setDoGrad] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const { loading: isSubmitting, update: updateMember } = useUpdate<
    Member,
    "createdAt" | "updatedAt"
  >(`members/${userStatus?.sid}`);

  const setData = useCallback(() => {
    const member = userStatus?.member;

    setChineseName(member?.name.chi ?? "");
    setGender(member?.gender ?? null);
    setDob(member?.dob ?? null);
    setEmail(member?.email ?? `${userStatus?.sid}@link.cuhk.edu.hk`);
    setPhone(member?.phone ?? "");
    setCollegeCode(member?.studentStatus.college ?? null);
    setMajorCode(member?.studentStatus.major ?? null);
    setDoEntry(member?.studentStatus.entryDate ?? null);
    setDoGrad(member?.studentStatus.gradDate ?? null);
  }, [userStatus?.sid, userStatus?.member]);

  useEffect(() => {
    if (!userLoaded && userStatus?.member) {
      setData();
      setUserLoaded(true);
    }
  }, [userStatus?.member, setData, userLoaded]);

  const onSubmit = useCallback(
    (newMemberData: {
      sid: string;
      name: {
        chi: string | null;
        eng: string | null;
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
    }) => {
      if (!newMemberData.name.eng) {
        toast.error("English name is missing.");
        return;
      }
      if (!newMemberData.studentStatus.college) {
        toast.error("College is missing.");
        return;
      }
      if (!newMemberData.studentStatus.major) {
        toast.error("Major is missing.");
        return;
      }
      if (!newMemberData.studentStatus.entryDate) {
        toast.error("Date of entry is missing.");
        return;
      }
      if (!newMemberData.studentStatus.gradDate) {
        toast.error("Date of graduation is missing.");
        return;
      }
      updateMember({
        ...newMemberData,
        name: {
          chi: newMemberData.name.chi,
          eng: newMemberData.name.eng,
        },
        studentStatus: {
          college: newMemberData.studentStatus.college,
          major: newMemberData.studentStatus.major,
          entryDate: newMemberData.studentStatus.entryDate,
          gradDate: newMemberData.studentStatus.gradDate,
        },
        ...(!userStatus?.member && { createdAt: serverTimestamp() }),
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          toast.success("You registration has been saved.");
          navigate("/member");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Your registration is not saved due to error.");
        });
    },
    [userStatus?.member, navigate, updateMember]
  );

  const submitButtonText = useMemo(
    () => (userStatus?.member ? "Update" : "Register"),
    [userStatus?.member]
  );

  useSetTitle(`Member Registration`);

  const [shouldPromptReset, setShouldPromptReset] = useState(false);

  const ResetPrompt = useCallback(
    () =>
      shouldPromptReset ? (
        <PromptModal
          message="Are you sure to reset all data?"
          onConfirm={() => {
            setData();
            setShouldPromptReset(false);
          }}
          onCancel={() => setShouldPromptReset(false)}
          confirmText="Reset"
          cancelText="Back"
          confirmColor="warning"
          cancelColor="info"
        />
      ) : (
        <></>
      ),
    [shouldPromptReset, setData]
  );

  if (!userStatus) {
    return <Navigate to="/" replace />;
  }
  return (
    <div>
      <Section>
        <Container>
          <Heading>Register</Heading>
          <PreventDefaultForm
            onSubmit={() =>
              onSubmit({
                sid: userStatus.sid,
                name: {
                  chi: chineseName || null,
                  eng: userStatus.displayName,
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
              })
            }
          >
            <>
              <TextField
                value={userStatus.sid}
                pattern="^\d{10}$"
                label="Student ID"
                required
              />
              <TextField
                value={userStatus.displayName ?? ""}
                label="English Name"
                placeholder="English Name as in CU Link Card"
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
                pattern=".+@.+"
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
              <Button.Group>
                <Button
                  type="button"
                  onClick={() => setShouldPromptReset(true)}
                  color="warning"
                >
                  Reset
                </Button>
                <Button color="primary" type="submit" disabled={isSubmitting}>
                  {submitButtonText}
                </Button>
              </Button.Group>
            </>
          </PreventDefaultForm>
        </Container>
      </Section>
      <ResetPrompt />
      <Loading loading={isSubmitting} />
    </div>
  );
};

export default Register;
