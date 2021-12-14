import Loading from "components/loading";
import ViewSeriesData from "components/viewSeriesData";
import { equalTo, orderByChild, query, ref } from "firebase/database";
import NotFound from "pages/notFound";
import React, { useEffect, useMemo } from "react";
import { Container, Heading } from "react-bulma-components";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { database, useGetAndListen } from "utils/firebase";
import { BookKey, LibraryBook } from "utils/libraryUtils";
import { useSetTitle } from "utils/miscHooks";

const BrowseBooks = (): React.ReactElement => {
  const { seriesId } = useParams();

  const queryRef = useMemo(
    () =>
      query(
        ref(database, "library/books/data"),
        orderByChild("seriesId"),
        equalTo(seriesId ?? null)
      ),
    [seriesId]
  );
  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useGetAndListen<Record<BookKey, LibraryBook> | null>(queryRef);

  const {
    data: seriesTitle,
    loading: seriesTitleLoading,
    error: seriesTitleError,
  } = useGetAndListen<string | null>(`library/series/data/${seriesId}/title`);
  const {
    data: seriesAuthor,
    loading: seriesAuthorLoading,
    error: seriesAuthorError,
  } = useGetAndListen<string | null>(`library/series/data/${seriesId}/author`);

  const seriesLoading = useMemo(
    () => seriesTitleLoading || seriesAuthorLoading,
    [seriesAuthorLoading, seriesTitleLoading]
  );

  useEffect(() => {
    if (seriesTitleError) {
      console.error(seriesTitleError);
      toast.error(seriesTitleError.message);
    }
  }, [seriesTitleError]);

  useEffect(() => {
    if (seriesAuthorError) {
      console.error(seriesAuthorError);
      toast.error(seriesAuthorError.message);
    }
  }, [seriesAuthorError]);

  useSetTitle(`Viewing ${seriesTitle ?? seriesId ?? "series"}`);

  if (!seriesId) {
    return <NotFound />;
  }

  return (
    <>
      <Loading loading={seriesLoading} />
      <Container className="mb-4">
        <Heading size={2}>{seriesTitle ?? "Unknown title"}</Heading>
        <Heading size={4} subtitle>
          by {seriesAuthor ?? "Unknown author"}
        </Heading>
      </Container>
      <ViewSeriesData
        seriesId={seriesId}
        data={bookData}
        loading={bookLoading}
        error={bookError}
        locations={{}}
      />
    </>
  );
};

export default BrowseBooks;
