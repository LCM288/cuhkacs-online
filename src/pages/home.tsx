import React, { useMemo, useCallback, useEffect } from "react";
import { signInWithPopup, OAuthProvider } from "firebase/auth";
import { auth } from "utils/firebase";
import { Heading, Button } from "react-bulma-components";
import useUserStatus from "utils/useUserStatus";
import { Navigate } from "react-router-dom";
import IndexWrapper from "components/indexWrapper";
import ReactMarkdown from "react-markdown";
import { appName } from "utils/const";
import { useGetAndListen } from "utils/firebase";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import { Message } from "types/db";

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

  const {
    data: welcomeMessage,
    error: welcomeMessageError,
    loading,
  } = useGetAndListen<Message>(`publicMessages/welcome`);

  useEffect(() => {
    if (welcomeMessageError) {
      console.error(welcomeMessageError);
      toast.info("Failed to get message.");
    }
  }, [welcomeMessageError]);

  useSetTitle(`Welcome to ${appName}`);

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
            <ReactMarkdown>{welcomeMessage.message}</ReactMarkdown>
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
