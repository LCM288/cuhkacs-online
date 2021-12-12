import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import EditSeriesData from "components/editSeriesData";
import AddBook from "components/addBook";
import { useGetAndListen } from "utils/firebase";
import { LibrarySeries } from "utils/libraryUtils";
import NotFound from "pages/notFound";

const EditSeries = (): React.ReactElement => {
  const { seriesId } = useParams();
  const {
    data: seriesData,
    loading: seriesLoading,
    error: seriesError,
  } = useGetAndListen<LibrarySeries | null>(`library/series/data/${seriesId}`);
  const firstLoading = useRef(true);
  const lastVolume = useMemo(() => null, []);
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
      <EditSeriesData
        seriesId={seriesId}
        data={seriesData}
        loading={seriesLoading}
        error={seriesError}
      />
      <AddBook
        seriesId={seriesId}
        lastVolume={lastVolume}
        locations={locations}
      />
    </>
  );
};

export default EditSeries;
