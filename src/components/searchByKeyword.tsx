import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { database, useGetAndListen } from "utils/firebase";
import {
  BookKey,
  encodeKeyword,
  LibraryBook,
  SeriesKey,
  useGetAndListenSeriesFromID,
} from "utils/libraryUtils";
import SeriesListTable from "components/seriesListTable";
import {
  orderByKey,
  query,
  ref,
  startAt,
  endAt,
  equalTo,
  orderByChild,
} from "firebase/database";
import { uniq } from "lodash";

interface Props {
  keyword: string;
}

const SearchByKeyword = ({ keyword }: Props): React.ReactElement => {
  const keywordQueryRef = useMemo(
    () =>
      query(
        ref(database, "/library/keyword_series"),
        orderByKey(),
        startAt(encodeKeyword(keyword)),
        endAt(encodeKeyword(keyword) + "\uffff")
      ),
    [keyword]
  );
  const {
    data: keywordsData,
    loading: keywordsLoading,
    error: keywordsError,
  } = useGetAndListen<Record<string, Record<SeriesKey, true>>>(keywordQueryRef);
  useEffect(() => {
    if (keywordsError) {
      console.error(keywordsError);
      toast.error(keywordsError.message);
    }
  }, [keywordsError]);

  const isbnQueryRef = useMemo(
    () =>
      query(
        ref(database, "/library/books/data"),
        orderByChild("isbn"),
        equalTo(keyword)
      ),
    [keyword]
  );
  const {
    data: booksData,
    loading: booksLoading,
    error: booksError,
  } = useGetAndListen<Record<BookKey, LibraryBook>>(isbnQueryRef);
  useEffect(() => {
    if (booksError) {
      console.error(booksError);
      toast.error(booksError.message);
    }
  }, [booksError]);

  const seriesIdList = useMemo(
    () =>
      uniq(
        (keywordsData
          ? Object.values(keywordsData).flatMap((seriesData) =>
              Object.keys(seriesData)
            )
          : []
        ).concat(
          booksData
            ? Object.values(booksData).map(({ seriesId }) => seriesId)
            : []
        )
      ),
    [keywordsData, booksData]
  );

  const { data: seriesData, loading: seriesLoading } =
    useGetAndListenSeriesFromID(seriesIdList);
  const seriesList = useMemo(
    () =>
      Object.keys(seriesData).map((key) => ({ ...seriesData[key], id: key })),
    [seriesData]
  );

  return (
    <SeriesListTable
      loading={keywordsLoading || booksLoading || seriesLoading}
      seriesList={seriesList}
    />
  );
};

export default SearchByKeyword;
