import React from "react";
import { Loader } from "react-bulma-components";

interface Props {
  loading: boolean;
}

const Loading = ({ loading }: Props): React.ReactElement => {
  return (
    <>
      {loading && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            background: "rgba(10, 10, 10, 0.2)",
            zIndex: 40,
          }}
        >
          <Loader
            style={{
              top: "calc((100vh - 50vmin) / 2)",
              left: " calc((100vw - 50vmin) / 2)",
              height: "50vmin",
              width: "50vmin",
            }}
          />
        </div>
      )}
    </>
  );
};

export default Loading;
