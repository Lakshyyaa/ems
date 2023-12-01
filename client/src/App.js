import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard";
import ErrorPage from "./components/ErrorPage/ErrorPage";
import Admin from "../src/components/Admin/Admin.jsx";
import LogoutButton from "./components/Logout/Logout.jsx";
const App = () => {
  return (
    <Router>
      {/* <LogoutButton /> */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/admin-dashboard" element={<Admin />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
