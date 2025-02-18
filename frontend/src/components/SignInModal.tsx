// In your SignInModal.tsx (simplified excerpt)
import React, { useState, useContext } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

interface SignInModalProps {
  show: boolean;
  handleClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ show, handleClose }) => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signin(email, password);
      setIsAuthenticated(true);
      handleClose();
      navigate("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || "Sign In failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotMsg("If that email is registered, a reset link has been sent.");
    } catch (error: any) {
      setForgotMsg("Failed to send reset link.");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header
        closeButton
        style={{ backgroundColor: theme.navBackground, color: theme.text }}
      >
        <Modal.Title>Sign In</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{ backgroundColor: theme.background, color: theme.text }}
      >
        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {!showForgot ? (
          <Form onSubmit={handleSignIn}>
            <Form.Group controlId="signInEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="signInPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Sign In
            </Button>
            <div className="text-center">
              <Button variant="link" onClick={() => setShowForgot(true)}>
                Forgot Password?
              </Button>
            </div>
          </Form>
        ) : (
          <Form onSubmit={handleForgotPassword}>
            <Form.Group controlId="forgotEmail" className="mb-3">
              <Form.Label>Enter your email to reset password</Form.Label>
              <Form.Control
                type="email"
                placeholder="Your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-2">
              Send Reset Link
            </Button>
            {forgotMsg && <Alert variant="info">{forgotMsg}</Alert>}
            <div className="text-center">
              <Button variant="link" onClick={() => setShowForgot(false)}>
                Back to Sign In
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer style={{ backgroundColor: theme.navBackground }}>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SignInModal;
