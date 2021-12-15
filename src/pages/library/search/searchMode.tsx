import NotFound from "pages/notFound";
import React from "react";
import { Outlet, useParams } from "react-router-dom";

const supportedSearchModes = ["keyword", "location"];

const SearchMode = (): React.ReactElement => {
  const { searchMode } = useParams();
  if (!searchMode || !supportedSearchModes.includes(searchMode)) {
    return <NotFound />;
  }
  return <Outlet />;
};

export default SearchMode;
