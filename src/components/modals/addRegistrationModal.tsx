import React, { useState, useCallback } from "react";
import { Heading, Modal, Button } from "react-bulma-components";
import Loading from "components/loading";
import PromptModal from "components/modals/promptModal";
import DOEntryField from "components/fields/doEntryField";
import TextField from "components/fields/textField";
import CollegeField from "components/fields/collegeField";
import DOGradField from "components/fields/doGradField";
import GenderField from "components/fields/genderField";
import DateField from "components/fields/dateField";
import MajorField from "components/fields/majorField";
import { PreventDefaultForm } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { CollegeCode } from "static/college.json";

export type NewMember = {
  sid: string | null;
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
};

interface Props {
  onSave: (newMemberData: NewMember) => void;
  onClose: () => void;
  loading: boolean;
}

const AddRegistrationModal = ({
  onSave,
  onClose,
  loading,
}: Props): React.ReactElement => {
  const [sid, setSID] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [chineseName, setChineseName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [dob, setDob] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [collegeCode, setCollegeCode] = useState<CollegeCode | null>(null);
  const [majorCode, setMajorCode] = useState<string | null>(null);
  const [doEntry, setDoEntry] = useState<string | null>(null);
  const [doGrad, setDoGrad] = useState<string | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  useClipped(openConfirmModal);

  const onConfirm = useCallback(
    (newMemberData: NewMember) => {
      onSave(newMemberData);
      setOpenConfirmModal(false);
    },
    [onSave]
  );

  const promptConfirm = useCallback(() => {
    setOpenConfirmModal(true);
  }, []);

  const cancelConfirm = useCallback(() => {
    setOpenConfirmModal(false);
  }, []);

  return (
    <Modal show closeOnEsc={false} onClose={onClose}>
      <Modal.Content className="has-background-white box">
        <PreventDefaultForm onSubmit={promptConfirm}>
          <>
            <Heading className="has-text-centered">New Registration</Heading>
            <TextField
              value={sid}
              setValue={setSID}
              pattern="^\d{1,16}$"
              label="Student ID"
              placeholder="Student ID"
              editable
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
            <div className="is-pulled-right buttons pt-4">
              <Button color="primary" type="submit">
                Add
              </Button>
              <Button color="danger" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        </PreventDefaultForm>
      </Modal.Content>
      {openConfirmModal && (
        <PromptModal
          message={`Are you sure to add a registration of ${englishName} (sid: ${sid})`}
          onConfirm={() =>
            onConfirm({
              sid,
              name: {
                chi: chineseName || null,
                eng: englishName || null,
              },
              gender,
              dob,
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
          onCancel={cancelConfirm}
        />
      )}
      <Loading loading={loading} />
    </Modal>
  );
};

export default AddRegistrationModal;
