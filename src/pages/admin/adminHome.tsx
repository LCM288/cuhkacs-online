import React, { useMemo } from "react";
import { DateTime } from "luxon";
import { Link, Navigate } from "react-router-dom";
import { Button, Heading } from "react-bulma-components";
import IndexWrapper from "components/indexWrapper";
import useUserStatus from "utils/useUserStatus";
import { appName } from "utils/const";
import { useSetTitle } from "utils/miscHooks";

const AdminHome = (): React.ReactElement => {
  const userStatus = useUserStatus();
  const greeting = useMemo(() => {
    // ref: https://gist.github.com/James1x0/8443042

    const splitMoring = 5; // 24hr time to split the afternoon
    const splitAfternoon = 12; // 24hr time to split the afternoon
    const splitEvening = 17; // 24hr time to split the evening
    const currentHour = DateTime.local().hour;

    const userName = userStatus?.member?.name.eng ?? "";

    if (splitAfternoon <= currentHour && currentHour <= splitEvening) {
      return `Good afternoon, ${userName}`;
    }
    if (currentHour <= splitMoring || splitEvening <= currentHour) {
      return `Good evening, ${userName}`;
    }
    return `Good morning, ${userName}`;
  }, [userStatus]);

  useSetTitle(`Welcome to ${appName}`);

  if (!userStatus) {
    return <Navigate to="/" replace />;
  }

  if (!userStatus.executive) {
    return <Navigate to="/member" replace />;
  }

  return (
    <IndexWrapper>
      <>
        <Heading className="p-5 mb-0">{appName} Admin</Heading>
        <div className="mb-5">{greeting}</div>
        <Button.Group className="is-justify-content-center">
          <Link to="/member" className="button is-info">
            Member Page
          </Link>
        </Button.Group>
      </>
    </IndexWrapper>
  );
};

export default AdminHome;
