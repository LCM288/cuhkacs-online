import React from "react";
import { useParams } from "react-router-dom";
import EditSeriesData from "components/editSeriesData";

const EditSeries = (): React.ReactElement => {
  const { seriesId } = useParams();

  return (
    <>
      <EditSeriesData seriesId={seriesId} />
      The series ID is {seriesId}
    </>
  );
};

export default EditSeries;
