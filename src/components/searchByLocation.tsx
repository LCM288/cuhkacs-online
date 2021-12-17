import React, { useCallback, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { useGetAndListen } from "utils/firebase";
import {
  encodeLocation,
  LibrarySeries,
  SeriesKey,
  useGetAndListenFromID,
} from "utils/libraryUtils";
import SeriesListTable from "components/seriesListTable";

interface Props {
  location: string;
}

const SearchByLocation = ({ location }: Props): React.ReactElement => {
  const encodedLocation = useMemo(() => encodeLocation(location), [location]);
  const {
    data: seriesIdData,
    loading: seriesIdLoading,
    error: seriesIdError,
  } = useGetAndListen<Record<SeriesKey, number>>(
    `/library/location_series/${encodedLocation}`
  );

  useEffect(() => {
    if (seriesIdError) {
      console.error(seriesIdError);
      toast.error(seriesIdError.message);
    }
  }, [seriesIdError]);

  const seriesIdList = useMemo(
    () =>
      seriesIdData
        ? Object.keys(seriesIdData).filter((key) => seriesIdData[key] !== 0)
        : [],
    [seriesIdData]
  );

  const getPathFromId = useCallback(
    (id: string) => `/library/series/data/${id}`,
    []
  );
  const { data: seriesData, loading: seriesLoading } =
    useGetAndListenFromID<LibrarySeries>(seriesIdList, getPathFromId);
  const seriesList = useMemo(
    () =>
      Object.keys(seriesData).map((key) => ({ ...seriesData[key], id: key })),
    [seriesData]
  );

  return (
    <SeriesListTable
      loading={seriesIdLoading || seriesLoading}
      seriesList={seriesList}
    />
  );
};

export default SearchByLocation;
