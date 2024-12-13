import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./admin/context/AuthContext";
import PrivateRoute from "./admin/hooks/PrivateRoute";
import Login from "./admin/page/Login";
import Calendar from "./admin/page/Calendar";
import Users_manage from "./admin/page/Users_manage";
import Admin from "./admin/page/Admin";
import Case_manage from "./admin/page/Case_manage";
import ErrorPage from "./shared/Errorpage";
import Room_schedule from "./admin/page/RoomSchedule";
import AddCase from "./admin/components/Case_manage/AddCase";
import { notification } from "antd";

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
              <Route path="users_manage" element={<Users_manage />} />
              <Route path="case_manage" element={<Case_manage />}>
                <Route path="add_case" element={<AddCase />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
