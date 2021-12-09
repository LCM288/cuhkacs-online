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
    data: libraryMessage,
    error: libraryMessageError,
    loading: libraryMessageLoading,
  } = useGetAndListen<Message>(`publicMessages/library`);

  useEffect(() => {
    if (libraryMessageError) {
      console.error(libraryMessageError);
      toast.info("Failed to get message.");
    }
  }, [libraryMessageError]);

  useSetTitle(libraryName);

  return (
    <IndexWrapper>
      <>
        {libraryMessageLoading ? (
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
        {libraryMessage && (
          <div className="mb-5">
            <Markdown>{libraryMessage.message}</Markdown>
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
