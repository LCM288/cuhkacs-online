import SearchByLocation from "components/searchByLocation";
import NotFound from "pages/notFound";
import React from "react";
import { useParams } from "react-router-dom";
import { useSetTitle } from "utils/miscHooks";

const SearchBy = (): React.ReactElement => {
  const { searchMode, searchParam } = useParams();

  useSetTitle("Searching the library");

  if (!searchParam) {
    return <NotFound />;
  }

  if (searchMode === "location") {
    return <SearchByLocation location={searchParam} />;
  }

  return (
    <>
      Mode: {searchMode}
      <br />
      Param: {searchParam}
    </>
  );
};

export default SearchBy;
