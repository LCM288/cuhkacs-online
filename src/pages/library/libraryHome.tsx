import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Heading, Image as BulmaImage } from "react-bulma-components";
import Markdown from "components/markdown";
import IndexWrapper from "components/indexWrapper";
import useUserStatus from "utils/useUserStatus";
import { useGetAndListen } from "utils/firebase";
import { libraryName } from "utils/const";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import { Message } from "types/db";
import indexLogo from "static/indexLogo.png";

const LibraryHome = (): React.ReactElement => {
  const userStatus = useUserStatus();

  const {
    data: welcomeMessage,
    error: welcomeMessageError,
    loading: welcomeMessageLoading,
  } = useGetAndListen<Message>(`publicMessages/welcome`);

  useEffect(() => {
    if (welcomeMessageError) {
      console.error(welcomeMessageError);
      toast.info("Failed to get message.");
    }
  }, [welcomeMessageError]);

  useSetTitle(libraryName);

  const isLoading = useMemo(
    () => welcomeMessageLoading,
    [welcomeMessageLoading]
  );

  return (
    <IndexWrapper>
      <>
        {isLoading ? (
          <Heading className="p-5 mb-0">Loading...</Heading>
        ) : (
          <BulmaImage
            src={indexLogo}
            style={{
              maxWidth: "50%",
              margin: "auto",
            }}
          />
        )}
        {welcomeMessage && (
          <div className="mb-5">
            <Markdown>{welcomeMessage.message}</Markdown>
          </div>
        )}
        <Button.Group className="is-justify-content-center">
          {userStatus && (
            <Link to="/member" className="button is-warning">
              Member Portal
            </Link>
          )}
          {userStatus?.executive && (
            <Link to="/admin" className="button is-info">
              Admin Portal
            </Link>
          )}
        </Button.Group>
      </>
    </IndexWrapper>
  );
};

export default LibraryHome;
