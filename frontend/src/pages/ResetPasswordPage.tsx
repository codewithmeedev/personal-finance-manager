import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import { ResetPasswordResponse } from '../types/auth';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      // Explicitly annotate data with ResetPasswordResponse
      const data: ResetPasswordResponse = await authService.resetPassword(token || "", newPassword);
      // Now TypeScript knows data has properties like msg, access_token, etc.
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);
      setIsAuthenticated(true);
      setMessage(data.msg || "Password reset successful. Redirecting...");
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    }
  };

  if (!token) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Reset token not found. Please request a new password reset.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-5 py-5 content-padding" style={{ maxWidth: "400px" }}>
      <h2 className="mb-4">Reset Password</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="newPassword" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword" className="mb-3">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="w-100">
          Reset Password
        </Button>
      </Form>
    </Container>
  );
};

export default ResetPasswordPage;
