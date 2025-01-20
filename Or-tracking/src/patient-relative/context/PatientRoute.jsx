import React from "react";
import { Outlet } from "react-router-dom";

const PatientRoute = ({ children }) => {
  return children ? <>{children}</> : <Outlet />;
};

export default PatientRoute;
