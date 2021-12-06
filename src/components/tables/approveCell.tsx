import React, { useState, useCallback } from "react";
import { Button } from "react-bulma-components";
import ApproveModal from "components/modals/approveModal";
import { toast } from "react-toastify";
import { StopClickDiv } from "utils/domEventHelpers";
import useClipped from "utils/useClipped";
import { useUpdate } from "utils/firebase";
import { Member } from "types/db";
import { serverTimestamp } from "firebase/database";
import { DateTime } from "luxon";

interface Props {
  sid: string;
  englishName: string;
  gradDate: string;
}

const ApproveCell = ({
  sid,
  englishName,
  gradDate,
}: Props): React.ReactElement => {
  const { loading: approveLoading, update: approveMembership } = useUpdate<
    Member,
    "since" | "lastRenewed" | "updatedAt"
  >(`members/${sid}`);

  const [openModal, setOpenModal] = useState(false);

  useClipped(openModal);

  const approve = useCallback(
    (memberUntil: string | null) => {
      if (!memberUntil) {
        toast.error("Please set the membership expiration date.");
        return;
      }
      const until = DateTime.fromISO(memberUntil, {
        zone: "Asia/Hong_Kong",
      }).valueOf();
      approveMembership({
        memberStatus: {
          since: serverTimestamp(),
          lastRenewed: serverTimestamp(),
          until,
        },
        updatedAt: serverTimestamp(),
      })
        .then(() => {
          toast.success(`${englishName} (sid: ${sid}) is now a member.`);
          setOpenModal(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message);
        });
    },
    [approveMembership, englishName, sid]
  );

  const promptApprove = useCallback(() => {
    setOpenModal(true);
  }, []);

  const cancelApprove = useCallback(() => {
    setOpenModal(false);
  }, []);

  return (
    <StopClickDiv>
      <>
        {openModal && (
          <ApproveModal
            sid={sid}
            englishName={englishName}
            gradDate={gradDate}
            onConfirm={approve}
            onCancel={cancelApprove}
          />
        )}
        <Button
          color="success"
          onClick={promptApprove}
          loading={approveLoading}
        >
          Approve
        </Button>
      </>
    </StopClickDiv>
  );
};

export default ApproveCell;
