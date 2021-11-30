import React, { useMemo, useState, useEffect } from "react";
import { DateTime } from "luxon";
import { Link, Navigate } from "react-router-dom";
import { Button, Heading } from "react-bulma-components";
import ReactMarkdown from "react-markdown";
import IndexWrapper from "components/indexWrapper";
import useUserStatus from "utils/useUserStatus";
import { ref, onValue, DataSnapshot, off } from "firebase/database";
import { database } from "utils/firebase";
import { appName } from "utils/const";

const MemberHome = (): React.ReactElement => {
  const userStatus = useUserStatus();
  const greeting = useMemo(() => {
    // ref: https://gist.github.com/James1x0/8443042

    const splitMoring = 5; // 24hr time to split the afternoon
    const splitAfternoon = 12; // 24hr time to split the afternoon
    const splitEvening = 17; // 24hr time to split the evening
    const currentHour = DateTime.local().hour;

    const userName = userStatus?.member?.name.eng ?? "";

    if (splitAfternoon <= currentHour && currentHour <= splitEvening) {
      return `Good afternoon, ${userName}`;
    }
    if (currentHour <= splitMoring || splitEvening <= currentHour) {
      return `Good evening, ${userName}`;
    }
    return `Good morning, ${userName}`;
  }, [userStatus]);

  const registerButtonText = useMemo(() => {
    if (userStatus?.isExpired) {
      return "Renew";
    } else if (userStatus?.isVisitor) {
      return "Register";
    } else if (userStatus?.isRegistered) {
      return "Update Registration";
    } else {
      return "";
    }
  }, [userStatus]);

  const customMessageKey = useMemo(() => {
    if (userStatus?.isExpired) {
      return "expired";
    } else if (userStatus?.isVisitor) {
      return "visitor";
    } else if (userStatus?.isRegistered) {
      return "registered";
    } else if (userStatus?.isActive) {
      return "member";
    } else {
      return "";
    }
  }, [userStatus]);

  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

  useEffect(() => {
    const customMessageRef = ref(
      database,
      `publicMessages/${customMessageKey}`
    );
    const customMessageCallback = (snapshot: DataSnapshot) => {
      setCustomMessage(snapshot.val() ?? "");
    };
    onValue(customMessageRef, customMessageCallback);
    return () => off(customMessageRef, "value", customMessageCallback);
  }, [customMessageKey]);

  useEffect(() => {
    const welcomeMessageRef = ref(database, `publicMessages/welcome`);
    const welcomeMessageCallback = (snapshot: DataSnapshot) => {
      setWelcomeMessage(snapshot.val() ?? "");
    };
    onValue(welcomeMessageRef, welcomeMessageCallback);
    return () => off(welcomeMessageRef, "value", welcomeMessageCallback);
  });

  useEffect(() => {
    document.title = `Welcome to ${appName}`;
  });

  const isLoading = useMemo(
    () => customMessage === null || welcomeMessage === null,
    [customMessage, welcomeMessage]
  );

  if (!userStatus) {
    return <Navigate to="/" replace />;
  }

  return (
    <IndexWrapper>
      <>
        {isLoading && <Heading className="p-5 mb-0">Loading...</Heading>}
        {<Heading className="p-5 mb-0">{appName}</Heading>}
        <div className="mb-5">{greeting}</div>
        {welcomeMessage && (
          <div className="mb-5">
            <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
          </div>
        )}
        {customMessage && (
          <div className="mb-5">
            <ReactMarkdown>{customMessage}</ReactMarkdown>
          </div>
        )}
        <Button.Group className="is-justify-content-center">
          {registerButtonText && (
            <Link to="/member/register" className="button is-primary">
              {registerButtonText}
            </Link>
          )}
          {userStatus.executive && (
            <Link to="/admin" className="button is-info">
              Admin Portal
            </Link>
          )}
        </Button.Group>
      </>
    </IndexWrapper>
  );
};

export default MemberHome;
