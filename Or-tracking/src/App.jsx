// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, checkAuth, useAuth } from "./admin/components/AuthContext";
import Login from "./admin/page/Login";
import Calendar from "./admin/page/Calendar";
import Users_manage from "./admin/page/Users_manage";
import Admin from "./admin/page/Admin";
import Case_manage from "./admin/page/Case_manage";
import ErrorPage from "./shared/Errorpage";
import Room_schedule from "./admin/page/RoomSchedule";
import AddCase from "./admin/components/Case_manage/AddCase";
import { notification } from "antd";
import PrivateRoute from "./admin/components/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          >
            <Route
              path="room_schedule"
              element={
                <PrivateRoute>
                  <Room_schedule />
                </PrivateRoute>
              }
            />
            <Route
              path="calendar"
              element={
                <PrivateRoute>
                  <Calendar />
                </PrivateRoute>
              }
            />
            <Route
              path="users_manage"
              element={
                <PrivateRoute>
                  <Users_manage />
                </PrivateRoute>
              }
            />
            <Route
              path="case_manage"
              element={
                <PrivateRoute>
                  <Case_manage />
                </PrivateRoute>
              }
            >
              <Route
                path="add_case"
                element={
                  <PrivateRoute>
                    <AddCase />
                  </PrivateRoute>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
