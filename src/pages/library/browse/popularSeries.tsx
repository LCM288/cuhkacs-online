import PopularSeriesList from "components/popularSeriesList";
import React from "react";
import { useSetTitle } from "utils/miscHooks";

const PopularSeries = (): React.ReactElement => {
  useSetTitle("Popular Series");
  return <PopularSeriesList />;
};

export default PopularSeries;
