import React from "react";
import { useSetTitle } from "utils/miscHooks";

const NotFound = (): React.ReactElement => {
  useSetTitle("Page not found");
  return <div>404 Not Found</div>;
};

export default NotFound;
