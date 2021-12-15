import React from "react";
import SeriesList from "components/seriesList";
import { Link } from "react-router-dom";
import { useSetTitle } from "utils/miscHooks";

const EditSeriesHome = (): React.ReactElement => {
  useSetTitle("Browsing Series List");
  return (
    <>
      <div className="mb-4">
        <Link to="/library/edit/series/new" className="button is-primary">
          Add new Series
        </Link>
      </div>
      <SeriesList editable />
    </>
  );
};

export default EditSeriesHome;
