import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Block,
  Button,
  Heading,
  Image as BulmaImage,
} from "react-bulma-components";
import Markdown from "components/markdown";
import IndexWrapper from "components/indexWrapper";
import useUserStatus from "utils/useUserStatus";
import { useGetAndListen } from "utils/firebase";
import { libraryName } from "utils/const";
import { toast } from "react-toastify";
import { useSetTitle } from "utils/miscHooks";
import { Message } from "types/db";
import indexLogo from "static/indexLogo.png";
import PopularSeriesList from "components/popularSeriesList";

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
      <BulmaImage
        src={indexLogo}
        style={{
          maxWidth: "50%",
          margin: "auto",
        }}
      />
      <Block className="has-text-left">
        <PopularSeriesList />
      </Block>
      {libraryMessageLoading && (
        <Heading className="p-5 mb-0">Loading...</Heading>
      )}
      {libraryMessage && (
        <div className="mb-5">
          <Markdown>{libraryMessage.message}</Markdown>
        </div>
      )}
    </IndexWrapper>
  );
};

export default LibraryHome;
