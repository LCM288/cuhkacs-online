import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import EditSeriesData from "components/editSeriesData";
import AddBook from "components/addBook";
import { useGetAndListen, database } from "utils/firebase";
import { BookKey, LibraryBook, LibrarySeries } from "utils/libraryUtils";
import NotFound from "pages/notFound";
import ViewSeriesData from "components/viewSeriesData";
import { Container, Section } from "react-bulma-components";
import { ref, query, orderByChild, equalTo } from "firebase/database";

const EditSeries = (): React.ReactElement => {
  const { seriesId } = useParams();

  const {
    data: seriesData,
    loading: seriesLoading,
    error: seriesError,
  } = useGetAndListen<LibrarySeries | null>(`library/series/data/${seriesId}`);

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

  const firstLoading = useRef(true);
  const nextVolume = useMemo(
    () =>
      Math.max(
        1,
        ...Object.values(bookData ?? {})
          .map(({ volume }) => parseFloat(volume))
          .filter((volume) => !isNaN(volume))
          .map((volume) => Math.floor(volume + 1))
      ),
    [bookData]
  );
  const locations = useMemo(() => seriesData?.locations ?? {}, [seriesData]);

  useEffect(() => {
    if (seriesData) {
      firstLoading.current = false;
    }
  }, [seriesLoading, seriesData]);

  if (!seriesId || (firstLoading.current && seriesData === null)) {
    return <NotFound />;
  }

  return (
    <>
      <Section className="pt-0">
        <EditSeriesData
          seriesId={seriesId}
          data={seriesData}
          loading={seriesLoading}
          error={seriesError}
        />
        <Container className="mt-5">
          <ViewSeriesData
            seriesId={seriesId}
            data={bookData}
            loading={bookLoading}
            error={bookError}
          />
        </Container>
        <AddBook
          seriesId={seriesId}
          nextVolume={nextVolume}
          locations={locations}
        />
      </Section>
    </>
  );
};

export default EditSeries;
