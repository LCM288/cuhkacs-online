import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Button, Section, Container, Heading } from "react-bulma-components";
import { Navigate } from "react-router-dom";
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

const Register = (): React.ReactElement => {
  const userStatus = useUserStatus();

  const [chineseName, setChineseName] = useState<string>("");
  const [gender, setGender] = useState<string | null>(null);
  const [dob, setDob] = useState<string | null>(null);
  const [email, setEmail] = useState(`${userStatus?.sid}@link.cuhk.edu.hk`);
  const [phone, setPhone] = useState<string>("");
  const [collegeCode, setCollegeCode] = useState<string | null>(null);
  const [majorCode, setMajorCode] = useState<string | null>(null);
  const [doEntry, setDoEntry] = useState<string | null>(null);
  const [doGrad, setDoGrad] = useState<string | null>(null);
  const userLoaded = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!userLoaded.current && userStatus?.member) {
      setData();
      userLoaded.current = true;
    }
  }, [userStatus?.member, setData]);

  const validDate = useCallback((date: string) => {
    return /^\d{4}-\d{2}-\d{2}$/g.test(date) ? date : null;
  }, []);

  const onSubmit = useCallback(() => {
    // Todo
  }, []);

  const submitButtonText = useMemo(
    () => (userStatus?.member ? "Update" : "Register"),
    [userStatus?.member]
  );

  useEffect(() => {
    document.title = `Member Registration`;
  });

  if (!userStatus) {
    return <Navigate to="/" replace />;
  }
  return (
    <div>
      <Section>
        <Container>
          <Heading>Register</Heading>
          <PreventDefaultForm
            onSubmit={
              () => onSubmit()
              // TODO
            }
          >
            <>
              <TextField
                value={userStatus?.sid}
                pattern="^\d{10}$"
                label="Student ID"
              />
              <TextField
                value={userStatus?.displayName ?? ""}
                label="English Name"
                placeholder="English Name as in CU Link Card"
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
                pattern="(?:\+[0-9]{2,3}-[0-9]{1,15})|(?:[0-9]{8})"
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
                <Button type="button" onClick={setData}>
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
      <Loading loading={isSubmitting} />
    </div>
  );
};

export default Register;
