import React, { useEffect } from "react";
import { Heading, Button } from "react-bulma-components";
import useUserStatus from "utils/useUserStatus";
import { Link, Navigate } from "react-router-dom";
import IndexWrapper from "components/indexWrapper";
import Markdown from "components/markdown";
import { appName } from "utils/const";
import { useGetAndListen } from "utils/firebase";
import { toast } from "react-toastify";
import { useSetTitle, useSignInCallback } from "utils/miscHooks";
import { Message } from "types/db";
import { useSetIcon } from "utils/miscHooks";
import cuhkacsIcon from "static/cuhkacs.ico";

const Home = (): React.ReactElement => {
  const userStatus = useUserStatus();
  const signInCallback = useSignInCallback();

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

  useSetIcon(cuhkacsIcon);

  if (userStatus) {
    return (
      <Navigate to={userStatus.executive ? "/admin" : "/member"} replace />
    );
  }
  return (
    <IndexWrapper>
      {loading && <Heading className="p-5 mb-0">Loading...</Heading>}
      <Heading className="p-5 mb-0">{appName}</Heading>
      {welcomeMessage && (
        <div className="mb-5">
          <Markdown>{welcomeMessage.message}</Markdown>
        </div>
      )}
      <Button.Group className="is-justify-content-center" size="medium">
        <Link to="/library" className="button is-light">
          Library Portal
        </Link>
        <Button color="link" onClick={signInCallback}>
          Login with CUHK OnePass
        </Button>
      </Button.Group>
    </IndexWrapper>
  );
};

export default Home;
