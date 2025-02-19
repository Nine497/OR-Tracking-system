import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./admin/context/AuthContext";
import PrivateRoute from "./admin/hooks/PrivateRoute";
import Login from "./admin/page/Login";
import Calendar from "./admin/page/Calendar";
import Users_manage from "./admin/page/Users_manage";
import Admin from "./admin/page/Admin";
import Case_manage from "./admin/page/Case_manage";
import ErrorPage from "./shared/Errorpage";
import AddCase from "./admin/components/Case_manage/AddCase";
import EditCase from "./admin/components/Case_manage/EditCase";
import PermissionDenied from "./admin/page/permissionDenied";
import PermissionRoute from "./admin/hooks/PermissionRoute";
import PatientMain from "./patient-relative/page/PatientMain";
import "./patient-relative/page/i18n";
import { PatientProvider } from "./patient-relative/context/PatientContext";
import View from "./patient-relative/page/View";
import PatientRoute from "./patient-relative/context/PatientRoute";
import Room_schedule from "./admin/page/RoomSchedule";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route path="/admin" element={<PrivateRoute />}>
            <Route path="" element={<Admin />}>
              <Route path="room_schedule" element={<Room_schedule />} />
              <Route path="calendar" element={<Calendar />} />

              <Route
                path="users_manage"
                element={<PermissionRoute requiredPermission={"10"} />}
              >
                <Route path="" element={<Users_manage />} />
              </Route>
              <Route
                path="case_manage"
                element={<PermissionRoute requiredPermission={"20"} />}
              >
                <Route path="" element={<Case_manage />} />
                <Route path="add_case" element={<AddCase />} />
                <Route path="edit_case" element={<EditCase />} />
              </Route>

              <Route path="permissionDenied" element={<PermissionDenied />} />
            </Route>
          </Route>

          <Route
            path="/ptr"
            element={
              <PatientProvider>
                <Outlet />
              </PatientProvider>
            }
          >
            <Route path="" element={<PatientMain />} />
            <Route
              path="view"
              element={
                <PatientRoute>
                  <View />
                </PatientRoute>
              }
            />
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
