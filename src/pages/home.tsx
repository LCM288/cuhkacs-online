import React, { useMemo, useCallback, useEffect, useState } from "react";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { ref, onValue, DataSnapshot, off } from "firebase/database";
import { auth, database } from "utils/firebase";
import { Heading, Button } from "react-bulma-components";
import useUserStatus from "utils/useUserStatus";
import { Navigate } from "react-router-dom";
import IndexWrapper from "components/indexWrapper";
import ReactMarkdown from "react-markdown";
import { appName } from "utils/const";

const Home = (): React.ReactElement => {
  const userStatus = useUserStatus();
  const provider = useMemo(() => {
    const newProvider = new OAuthProvider("microsoft.com");
    newProvider.setCustomParameters({
      prompt: "select_account",
      domain_hint: "link.cuhk.edu.hk",
      tenant: "link.cuhk.edu.hk",
    });
    return newProvider;
  }, []);
  const signInCallback = useCallback(() => {
    signInWithPopup(auth, provider).catch((error) => console.error(error));
  }, [provider]);

  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const loading = useMemo(() => welcomeMessage === null, [welcomeMessage]);

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

  if (userStatus) {
    return (
      <Navigate to={userStatus.executive ? "/admin" : "/member"} replace />
    );
  }
  return (
    <IndexWrapper>
      <>
        {loading && <Heading className="p-5 mb-0">Loading...</Heading>}
        <Heading className="p-5 mb-0">{appName}</Heading>
        {welcomeMessage && (
          <div className="mb-5">
            <ReactMarkdown>{welcomeMessage}</ReactMarkdown>
          </div>
        )}
        <Button
          color="link"
          onClick={signInCallback}
          size="medium"
          renderAs="a"
        >
          Login with CUHK OnePass
        </Button>
      </>
    </IndexWrapper>
  );
};

export default Home;
