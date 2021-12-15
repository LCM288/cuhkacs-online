import SearchByKeyword from "components/searchByKeyword";
import SearchByLocation from "components/searchByLocation";
import NotFound from "pages/notFound";
import React from "react";
import { useParams } from "react-router-dom";
import { useSetTitle } from "utils/miscHooks";

const SearchBy = (): React.ReactElement => {
  const { searchMode, searchParam } = useParams();

  useSetTitle(
    searchMode === "keyword"
      ? `Searching books: ${searchParam}`
      : searchMode === "location"
      ? `Searching books at ${searchParam}`
      : "Search the library"
  );

  if (!searchParam) {
    return <NotFound />;
  }

  if (searchMode === "location") {
    return <SearchByLocation location={searchParam} />;
  }

  if (searchMode === "keyword") {
    return <SearchByKeyword keyword={searchParam} />;
  }

  if (searchMode === "keyword") {
    return <NotFound />;
  }

  return <NotFound />;
};

export default SearchBy;
