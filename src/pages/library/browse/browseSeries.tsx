import SeriesList from "components/seriesList";
import React from "react";
import { useSetTitle } from "utils/miscHooks";

const BrowseSeries = (): React.ReactElement => {
  useSetTitle("Browsing series");

  return <SeriesList />;
};

export default BrowseSeries;
