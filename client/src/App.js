import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/signup/Dashboard"; // Create Dashboard component for the new page
import TeacherDashboard from "./components/TeacherDashboard/TeacherDashboard";
import ErrorPage from "./components/ErrorPage/ErrorPage";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path='*' element={<ErrorPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
