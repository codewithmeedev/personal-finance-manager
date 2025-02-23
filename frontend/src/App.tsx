// src/App.tsx

import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import UserInfoPage from "./pages/UserInfoPage";
import SignUpPage from "./pages/SignUpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import MainNavbar from "./components/MainNavbar";
import Footer from "./components/Footer";
import { ThemeContext } from "./context/ThemeContext";
import ContactUsPage from "./pages/ContactUsPage";

const App: React.FC = () => {
  const { theme } = useContext(ThemeContext);

  // Apply the global theme to the entire app container
  const appStyle: React.CSSProperties = {
    backgroundColor: theme.background,
    color: theme.text,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };

  return (
    <div className="App" style={appStyle}>
      <Router>
        <MainNavbar />
        {/* The main-content flexes so the footer is pushed to bottom if content is short */}
        <div className="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/userinfo" element={<UserInfoPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </div>
  );
};

export default App;
