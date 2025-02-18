import React, { useState, useContext } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { signupSchema } from "../validation/userValidation";
import MainNavbar from "../components/MainNavbar";
import { AuthContext } from "../context/AuthContext";

const SignUpPage: React.FC = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signupSchema.parse({ username, email, password });
      await authService.signup(username, email, password);
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error: any) {
      if (error.name === "ZodError") {
        setMessage(error.errors[0].message);
      } else {
        setMessage(error.response?.data?.detail || "Signup failed");
      }
    }
  };

  return (
    <>
      <MainNavbar />
      <Container fluid className="mt-5 py-5 content-padding" style={{ maxWidth: "400px" }}>
        <h2 className="mb-4">Sign Up</h2>
        {message && <Alert variant="info">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="signupUsername" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="signupEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="signupPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100">
            Sign Up
          </Button>
        </Form>
      </Container>
    
    </>
  );
};

export default SignUpPage;
