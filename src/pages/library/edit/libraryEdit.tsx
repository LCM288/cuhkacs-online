import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import useUserStatus from "utils/useUserStatus";

const LibraryEdit = (): React.ReactElement => {
  const userStatus = useUserStatus();
  return userStatus?.executive ? (
    <Outlet />
  ) : (
    <Navigate to="/library" replace />
  );
};

export default LibraryEdit;
