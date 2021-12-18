import { limitToLast, orderByChild, query, ref } from "firebase/database";
import React, { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { database, useGetAndListen } from "utils/firebase";
import { LibrarySeries, SeriesKey } from "utils/libraryUtils";
import SeriesListTable from "components/seriesListTable";
import Loading from "components/loading";

const PopularSeriesList = (): React.ReactElement => {
  const queryRef = useMemo(
    () =>
      query(
        ref(database, "/library/series/data"),
        orderByChild("borrowCount"),
        limitToLast(15)
      ),
    []
  );
  const { data, loading, error } =
    useGetAndListen<Record<SeriesKey, LibrarySeries>>(queryRef);

  const seriesList = useMemo(
    () =>
      data
        ? Object.keys(data)
            .map((key) => ({ ...data[key], id: key }))
            .sort((a, b) => b.borrowCount - a.borrowCount)
        : [],
    [data]
  );

  useEffect(() => {
    if (error) {
      console.error(error);
      toast.error(error.message);
    }
  }, [error]);
  return (
    <>
      <Loading loading={loading} />
      <SeriesListTable seriesList={seriesList} />
    </>
  );
};

export default PopularSeriesList;
