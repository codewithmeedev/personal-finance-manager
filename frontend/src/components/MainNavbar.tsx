// src/components/MainNavbar.tsx
import React, { useState, useContext } from "react";
import { Navbar, Container, Nav, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import SignInModal from "./SignInModal";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

const MainNavbar: React.FC = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showSignIn, setShowSignIn] = useState(false);
  const navigate = useNavigate();

  const handleOpenSignIn = () => setShowSignIn(true);
  const handleCloseSignIn = () => setShowSignIn(false);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  // Determine if dark mode is active based on theme background color.
  const isDarkMode = theme.background === "#121212";

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        style={{
          backgroundColor: theme.navBackground,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to="/"
            style={{
              fontWeight: "700",
              color: theme.primary,
              fontSize: "1.3rem",
            }}
          >
            FinanceManager
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/" style={{ color: theme.text }}>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/about" style={{ color: theme.text }}>
                About
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard" style={{ color: theme.text }}>
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" style={{ color: theme.text }}>
                Contact Us
              </Nav.Link>
              {isAuthenticated && (
                <Nav.Link
                  as={Link}
                  to="/userinfo"
                  style={{ color: theme.text }}
                >
                  Your Information
                </Nav.Link>
              )}
            </Nav>
            <Nav className="d-flex align-items-center">
              {isAuthenticated ? (
                <Button variant="outline-danger" onClick={handleLogout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline-success"
                    className="me-2"
                    onClick={handleOpenSignIn}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => navigate("/signup")}
                  >
                    Get Started
                  </Button>
                </>
              )}
              {/* Dark Mode Toggle placed to the right */}
              <Form.Check
                type="switch"
                id="dark-mode-switch"
                label="Dark Mode"
                checked={isDarkMode}
                onChange={toggleTheme}
                style={{ color: theme.text, marginLeft: "1rem" }}
              />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <SignInModal show={showSignIn} handleClose={handleCloseSignIn} />
    </>
  );
};

export default MainNavbar;
