import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { database, useGetAndListen } from "utils/firebase";
import {
  encodeKeyword,
  SeriesKey,
  useGetAndListenSeriesFromID,
} from "utils/libraryUtils";
import SeriesListTable from "components/seriesListTable";
import { orderByKey, query, ref, startAt, endAt } from "firebase/database";
import { uniq } from "lodash";

interface Props {
  keyword: string;
}

const SearchByKeyword = ({ keyword }: Props): React.ReactElement => {
  const queryRef = useMemo(
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
  } = useGetAndListen<Record<string, Record<SeriesKey, true>>>(queryRef);

  useEffect(() => {
    if (keywordsError) {
      console.error(keywordsError);
      toast.error(keywordsError.message);
    }
  }, [keywordsError]);

  const seriesIdList = useMemo(
    () =>
      keywordsData
        ? uniq(
            Object.values(keywordsData).flatMap((seriesData) =>
              Object.keys(seriesData)
            )
          )
        : [],
    [keywordsData]
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
      loading={keywordsLoading || seriesLoading}
      seriesList={seriesList}
    />
  );
};

export default SearchByKeyword;
